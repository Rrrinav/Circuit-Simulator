#include <cstddef>
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>

#include "../../Include/Eigen/Dense"
#include "Element.hpp"
#include "Node.hpp"

/**
 * @class Element
 * @brief Base class for all electrical elements.
 */
class Circuit
{
  std::vector<Node *> _nodes;                     //> Vector of all nodes in the circuit
  std::vector<Element *> _elements;               //> Vector of all elements in the circuit
  std::vector<VoltageSource *> _voltage_sources;  //> Vector of all voltage sources in the circuit
  std::vector<CurrentSource *> _current_sources;  //> Vector of all current sources in the circuit
  size_t _volt_source_id;                         //> Voltage source identifier
  size_t _current_source_id;                      //> Current source identifier
  size_t _node_id;                                //> Node identifier
  Node *_ground;                                  //> Ground node

public:
  /**
     * @brief Constructor for Circuit.
     */
  Circuit();

  /**
     *@brief Destructor for Circuit
     */
  ~Circuit();

  /**
     * @brief Adds a node to the circuit.
     * @param name Name of the node.
     */
  void add_node(std::string name);

  /**
     * @brief Get a node by its Name
     * @param name Name of the node
     */
  Node *get_node(std::string name);

  /**
     * @brief Get an element by its Name
     * @param name Name of the element
     */
  Element *get_element(std::string name);

  /**
     * @brief Get a voltage source by its Name
     * @param name Name of the voltage source
     */
  VoltageSource *get_voltage_source(std::string name);

  /*
     * @brief Add a resistor to the circuit.
     * @param name Name of the resistor.
     * @param node_name Name of the node to which the resistor is connected.
     * @param value Resistance value of the resistor.
     */
  void add_resistor(std::string name, std::string node_name, double value);

  /*
     * @brief Add a voltage source to the circuit.
     * @param name Name of the voltage source.
     * @param node_name Name of the node to which the voltage source is connected.
     * @param value Voltage value of the voltage source.
     */
  void add_v_source(std::string name, std::string node_name, double value);

  /*
     * @brief Add a current source to the circuit.
     * @param name Name of the current source.
     * @param node_name Name of the node to which the current source is connected.
     * @param value Current value of the current source.
     */
  void add_c_source(std::string name, std::string node_name, double value);

  //We will set neg_node of last voltage source as ground node and set its voltage to 0 if no voltage_source is present
  //we will set the neg of current source as ground and set voltage to 0

  /*
     * @brief Set ground node
     */
  Node *set_ground();

  //Temporary function to check if all nodes and resistors are connected properly
  void check()
  {
    std::cout << "=======================Circuit Check============================\n\n";
    std::cout << "\n=======================Nodes: =================================\n";
    for (auto node : _nodes)
    {
      if (node->elements().empty())
        std::cerr << "Node: " << node->name() << " has no elements\n";
      std::cout << "Node: " << node->name() << " (ID: " << node->id() << ") Voltage: " << node->voltage() << "\n";
      std::cout << "Elements: ";
      for (auto element : node->elements()) std::cout << element->name() << " ";
      std::cout << "\n";
    }

    std::cout << "=================================Elements: ====================================\n";
    for (auto element : _elements)
    {
      if (element->get_neg_node() == nullptr || element->get_pos_node() == nullptr)
        std::cerr << "Element: " << element->name() << " has missing nodes\n";
      std::cout << "Element: " << element->name() << " Pos Node: " << element->get_pos_node()->name()
                << " Neg Node: " << element->get_neg_node()->name() << "\n";
    }

    std::cout << "=================================================Voltage Sources: \n============================";
    for (auto element : _voltage_sources)
    {
      if (element->get_neg_node() == nullptr || element->get_pos_node() == nullptr)
        std::cerr << "Element: " << element->name() << " has missing nodes\n";
      std::cout << "V Source: " << element->name() << " ID: " << element->id() << " Pos Node: " << element->get_pos_node()->name()
                << " Neg Node: " << element->get_neg_node()->name() << "\n"
                << "Current: " << element->get_current() << "\n";
    }
  }

  /*
    We will use Modified Nodal Analysis to solve circuits
    A * X = Z
    ------------------------------------------------------------------------------------------------------------------
    A (m + n) x (m + n) matrix where m is number of voltage sources and n is number of nodes - 1 (one is ground node)
    and A=[G  B]
          [C  D]
    Diagonal elemnets of G (n * n) are sum of conductances of all elements connected to the node
    Rest are -1 * conductance of element connected to the node and other node connected to the element at (N1, N2)
    B (n * m) element is 0, 1, -1 based on the node connected to the voltage source
    C (m * n) is transpose of B
    D (m * m) is 0 in case of independent voltage sources
    ------------------------------------------------------------------------------------------------------------------
    X (m + n) X 1  = [V]
                     [J]
    V (n * 1) is voltage of all nodes except ground node
    J (m * 1) is current of all voltage sources (opposite sign)
    ------------------------------------------------------------------------------------------------------------------
    Z (m + n) x 1 = [I]
                    [E]
    I (n   * 1) is current of all nodes (current sources to those nodes) except ground node, 0 when no current source
    E (m * 1) is voltage of all voltage sources to those nodes 
    */

  /*
     * @brief Solve the circuit
     */
  void solve();

private:
  /*
     * @brief Fill the matrix A
     * @param A Matrix A
     * @param num_nodes Number of nodes
     * @param num_voltage_sources Number of voltage sources
     */
  void fill_matrix_A(Eigen::MatrixXd &A, size_t num_nodes, size_t num_voltage_sources)
  {
    A = Eigen::MatrixXd::Zero(num_nodes + num_voltage_sources, num_nodes + num_voltage_sources);

    // Precompute conductances for resistors
    std::unordered_map<Element *, double> resistor_conductances;
    for (auto node : _nodes)
    {
      for (auto node_elem : node->elements())
        if (node_elem->type() == Type::RESISTOR)
          resistor_conductances[node_elem] = 1.0 / node_elem->value();
    }

    for (auto node : _nodes)
    {
      //We ignore ground nod
      if (node->is_ground())
        continue;

      for (auto node_elem : node->elements())
      {
        Node *other_node = node_elem->get_other_node(node);
        const double conductance = (node_elem->type() == Type::RESISTOR) ? resistor_conductances[node_elem] : 0.0;

        //Handle resistors
        if (node_elem->type() == Type::RESISTOR)
        {
          size_t common_resistors = num_common_resistors(node, other_node);
          //Diagonal elements
          //We will consider the prarallel nodes as one node, so if a node has multiple resistors connected to it but they all connected
          //to the same node, we will calculate cumulative conductance and solve them respectively
          //We also need to make sure we don't consider the same resistor twice since this is diagonal node and we will go to a nodw twice

          A(node->id(), node->id()) += 1 / conductance;

          //Off-diagonal elements
          if (!other_node->is_ground())
          {
            if (common_resistors == 1)
              A(node->id(), other_node->id()) -= 1 / conductance;
            else
              A(node->id(), other_node->id()) = -1 / solve_parallel(node, other_node);
          }
        }
        else if (node_elem->type() == Type::VOLTAGE_SUPPLY)  //Handle voltage sources
        {
          VoltageSource *v_source = static_cast<VoltageSource *>(node_elem);
          if (v_source->get_pos_node() == node)
          {
            A(node->id(), num_nodes + v_source->id()) = 1;
            A(num_nodes + v_source->id(), node->id()) = 1;
          }
          else
          {
            A(node->id(), num_nodes + v_source->id()) = -1;
            A(num_nodes + v_source->id(), node->id()) = -1;
          }
        }
      }
    }
  }

  //Top n elements of Z matrix will have algabraic sum of currents of all nodes except ground node and bottom m elements will have voltage of all voltage sources

  /*
    * @brief Fill the vector Z
    * @param Z Vector Z
    * @param num_nodes Number of nodes
    * @param num_voltage_sources Number of voltage sources
    */
  void fill_vector_Z(Eigen::VectorXd &Z, size_t num_nodes, size_t num_voltage_sources)
  {
    Z = Eigen::VectorXd::Zero(num_nodes + num_voltage_sources);
    for (auto voltage_source : _voltage_sources)
    {
      VoltageSource *v_source = static_cast<VoltageSource *>(voltage_source);
      Z(num_nodes + v_source->id()) = v_source->voltage();
    }
    for (auto node : _nodes)
    {
      if (!node->is_ground())
      {
        double sum = 0;
        for (auto elem : node->elements())
        {
          if (elem->type() == Type::CURRENT_SOURCE)
          {
            //if it is current source we will add value for pos node and subtract for neg node
            CurrentSource *c_source = static_cast<CurrentSource *>(elem);
            if (c_source->get_pos_node() == node)
              sum += c_source->value();
            else
              sum -= c_source->value();
          }
          std::cout << "Sum: " << sum << "\n";
          Z(node->id()) = sum;
        }
      }
    }
  }

  //We have set of simultaneous equations to solve for X
  //We will just use Eigen to solve AX = Z and fill resultant X values to nodes and voltage sources

  /*
    * @brief Solve for X
    * @param A Matrix A
    * @param X Vector X
    * @param Z Vector Z
    * @return True if solution is found, false otherwise
    */
  bool solve_for_x(Eigen::MatrixXd &A, Eigen::VectorXd &X, Eigen::VectorXd &Z)
  {
    X = A.colPivHouseholderQr().solve(Z);
    std::cout << '\n';
    for (int i = 0; i < X.size(); i++) std::cout << X(i) << " ";
    size_t num_nodes = _nodes.size() - 1;
    for (auto node : _nodes)
      if (!node->is_ground())
        node->set_voltage(X(node->id()));
    for (auto voltage_source : _voltage_sources)
    {
      VoltageSource *v_source = static_cast<VoltageSource *>(voltage_source);
      v_source->set_current(X(num_nodes + v_source->id()));
    }
    return true;
  }

  static double solve_parallel(Node *node_1, Node *node_2)
  {
    double sum = 0;
    for (auto elem : node_1->elements())
    {
      if (elem->get_other_node(node_1) == node_2 && elem->type() == Type::RESISTOR)
      {
        std::cout << "elem: " << elem->name() << '\n';
        sum = sum + (1 / elem->value());
      }
    }
    std::cout << "Sum: " << sum << "\n";

    return 1 / sum;
  }

  static size_t num_common_resistors(Node *node_1, Node *node_2)
  {
    size_t num = 0;
    for (auto elem : node_1->elements())
      if (elem->get_other_node(node_1) == node_2)
        num++;
    return num;
  }
};
