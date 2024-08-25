#include "Node.hpp"

// Constructor definition
Node::Node(size_t id, std::string name) : _id(id), _name(std::move(name)), _num_elements(0), _is_ground(false), _voltage(0.0) {}

// Destructor definition
Node::~Node() {}

// Function to add an element to the node
void Node::add_element(Element *element)
{
  _elements.push_back(element);
  _num_elements++;
}

// Getter for the number of elements
size_t Node::num_elements() const { return _num_elements; }

// Getter for the node ID
size_t Node::id() const { return _id; }

// Getter for the node name
std::string Node::name() const { return _name; }

// Getter for the elements connected to the node
std::vector<Element *> Node::elements() const { return _elements; }

// Function to set the node as ground
void Node::set_ground() { _is_ground = true; }

// Function to check if the node is ground
bool Node::is_ground() const { return _is_ground; }

// Getter for the node voltage
double Node::voltage() const { return _voltage; }

// Setter for the node voltage
void Node::set_voltage(double voltage) { _voltage = voltage; }
