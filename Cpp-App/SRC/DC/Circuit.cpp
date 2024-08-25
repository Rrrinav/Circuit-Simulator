#include "Circuit.hpp"

#include "../../Include/nlohmann/json.hpp"
using json = nlohmann::json;

#include <fstream>

//Constructor for Circuit
Circuit::Circuit() : _volt_source_id(0), _node_id(0) {}

//Destructor for Circuit
Circuit::~Circuit()
{
  for (auto node : _nodes) delete node;
  for (auto element : _elements) delete element;
}

//Add a new node to the circuit
void Circuit::add_node(std::string name) { _nodes.push_back(new Node(_node_id++, name)); }

//Retrurn node with the given name
Node *Circuit::get_node(std::string name)
{
  for (auto node : _nodes)
    if (node->name() == name)
      return node;
  return nullptr;
}

//Return element with a given name
Element *Circuit::get_element(std::string name)
{
  for (auto element : _elements)
    if (element->name() == name)
      return element;
  return nullptr;
}

//Return VoltageSource with a given name
VoltageSource *Circuit::get_voltage_source(std::string name)
{
  for (auto element : _voltage_sources)
    if (element->name() == name)
      return static_cast<VoltageSource *>(element);
  return nullptr;
}

void Circuit::add_resistor(std::string name, std::string node_name, double value)
{
  Node *node = get_node(node_name);

  // Node should be already present
  if (node == nullptr)
  {
    std::cerr << "Node not found\n";
    return;
  }

  // Check if the resistor is already present or not
  Element *resistor = get_element(name);

  if (resistor == nullptr)
  {
    // If resistor is not present, create a new resistor and set pos node
    resistor = new Resistor(name, value);
    resistor->set_pos_node(node);
    _elements.push_back(resistor);
  }
  else if (resistor->type() == Type::RESISTOR)
  {
    // If resistor is present and its type is RESISTOR
    // If pos node is set, neg node is not set, and value matches, set neg node
    if (resistor->get_pos_node() != nullptr && resistor->get_neg_node() == nullptr && resistor->value() == value)
      resistor->set_neg_node(node);
    else
      std::cerr << "Error: Resistor " << name << " already has both nodes assigned or value mismatch\n";
  }
  else
  {
    std::cerr << "Error: Element " << name << " is not a resistor\n";
  }
}

void Circuit::add_v_source(std::string name, std::string node_name, double value)
{
  Node *node = get_node(node_name);

  // Node should be already present
  if (node == nullptr)
  {
    std::cerr << "Node not found\n";
    return;
  }

  // Check if the voltage source is already present or not
  VoltageSource *v_source = get_voltage_source(name);

  if (v_source == nullptr)
  {
    // If voltage source is not present, create a new voltage source
    v_source = new VoltageSource(name, value, _volt_source_id++);
    if (value < 0)
      v_source->set_neg_node(node);
    else
      v_source->set_pos_node(node);
    _elements.push_back(v_source);
    _voltage_sources.push_back(v_source);
  }
  else if (v_source->type() == Type::VOLTAGE_SUPPLY)
  {
    // If voltage source is present and its type is VOLTAGE_SUPPLY
    // If pos node is set and value is -ve, set neg node; if neg node is set and value is +ve, set pos node
    if (v_source->get_pos_node() != nullptr && v_source->get_neg_node() == nullptr && value < 0)
      v_source->set_neg_node(node);
    else if (v_source->get_pos_node() == nullptr && v_source->get_neg_node() != nullptr && value > 0)
      v_source->set_pos_node(node);
    else
      std::cerr << "Error: Voltage source " << name << " already has both nodes assigned or value mismatch\n";
  }
  else
  {
    std::cerr << "Error: Element " << name << " is not a voltage source\n";
  }
}

void Circuit::add_c_source(std::string name, std::string node_name, double value)
{
  Node *node = get_node(node_name);
  // Node should be already present
  if (node == nullptr)
  {
    std::cerr << "Node not found\n";
    return;
  }
  // Check if the current source is already present or not
  Element *c_source = get_element(name);
  if (c_source == nullptr)
  {
    // If current source is not present, create a new current source
    c_source = new CurrentSource(name, value, _volt_source_id++);
    if (value < 0)
      c_source->set_neg_node(node);
    else
      c_source->set_pos_node(node);
    _elements.push_back(c_source);
    _current_sources.push_back(static_cast<CurrentSource *>(c_source));
  }
  else if (c_source->type() == Type::CURRENT_SOURCE)
  {
    // If current source is present and its type is CURRENT_SOURCE
    // If pos node is set and value is -ve, set neg node; if neg node is set and value is +ve, set pos node
    if (c_source->get_pos_node() != nullptr && c_source->get_neg_node() == nullptr && value < 0)
      c_source->set_neg_node(node);
    else if (c_source->get_pos_node() == nullptr && c_source->get_neg_node() != nullptr && value > 0)
      c_source->set_pos_node(node);
    else
      std::cerr << "Error: Current source " << name << " already has both nodes assigned or value mismatch\n";
  }
  else
  {
    std::cerr << "Error: Element " << name << " is not a current source\n";
  }
}

Node *Circuit::set_ground()
{
  if (_voltage_sources.empty())
  {
    _ground = _nodes.back();
    _ground->set_ground();
    _ground->set_voltage(0);
    return _ground;
  }
  VoltageSource *v_source = static_cast<VoltageSource *>(_voltage_sources.back());
  v_source->get_neg_node()->set_ground();
  v_source->get_neg_node()->set_voltage(0);
  _ground = v_source->get_neg_node();
  return _ground;
}

void Circuit::solve()
{
  size_t num_nodes = _nodes.size() - 1;  //Removing ground node
  size_t num_voltage_sources = _voltage_sources.size();
  Eigen::MatrixXd A;
  Eigen::VectorXd X;
  Eigen::VectorXd Z;

  set_ground();

  fill_matrix_A(A, num_nodes, num_voltage_sources);

  std::cout << "\n MATRIX A: \n";

  for (int i = 0; i < A.rows(); i++)
  {
    for (int j = 0; j < A.cols(); j++) std::cout << A(i, j) << " ";
    std::cout << std::endl;
  }

  //We don't need to fill X as we are solving for it
  X = Eigen::VectorXd::Zero(num_nodes + num_voltage_sources);
  fill_vector_Z(Z, num_nodes, num_voltage_sources);

  std::cout << "\n VECTOR Z: \n";

  for (int i = 0; i < Z.size(); i++) std::cout << Z(i) << " ";

  if (solve_for_x(A, X, Z))
    std::cout << "Solution found\n";
  else
    std::cerr << "Solution not found\n";
}

Circuit Circuit::create_from_json(const std::string &file_path)
{
  Circuit circuit;

  std::ifstream f(file_path);
  json Json = json::parse(f);
  auto nodes = Json["nodes"];

  for (auto &node : nodes)
  {
    std::string name = node["name"];
    circuit.add_node(name);
  }

  auto elements = Json["elements"];
  for (auto &element : elements)
  {
    std::string name = element["name"];
    std::string type = element["type"];
    double value = element["value"];
    std::string posNode = element["posNode"];
    std::string negNode = element["negNode"];

    if (type == "VOLTAGE_SUPPLY")
    {
      circuit.add_v_source(name, posNode, value);
      circuit.add_v_source(name, negNode, -value);
    }
    else if (type == "RESISTOR")
    {
      circuit.add_resistor(name, posNode, value);
      circuit.add_resistor(name, negNode, value);
    }
    else if (type == "CURRENT_SUPPLY")
    {
      circuit.add_c_source(name, posNode, value);
      circuit.add_c_source(name, negNode, -value);
    }
  }

  return circuit;
}

// TODO: Potential improvements according to Claude:
// [ Node addition ]: There's no check for duplicate node names. You might want to add this to prevent errors.
// [ Element addition ]: The code checks for existing elements, but it might be beneficial to add more robust error handling for cases where an element is partially defined.
// [ Ground node ]: The set_ground() function chooses the ground node based on voltage sources. You might want to allow manual ground node selection.
// [ Error handling ]: While there are some error messages, you might want to consider using exceptions for more robust error handling.
// [ Memory management ]: The class uses raw pointers and manual memory management. Consider using smart pointers to prevent memory leaks.
// [ Const correctness ]: Some methods like get_node(), get_element(), etc., could be marked as const.
// [ Input validation ]: There's limited input validation. You might want to add more checks, especially for negative resistances or invalid node names.
// [ Circuit consistency ]: There's no check to ensure the circuit is complete and solvable before attempting to solve it.
