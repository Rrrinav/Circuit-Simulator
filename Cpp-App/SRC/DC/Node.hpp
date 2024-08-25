#pragma once

#include <string>
#include <vector>

class Element;

/**
 * @class Node
 * @brief Class representing a node in an electrical circuit.
 */
class Node
{
private:
  std::vector<Element *> _elements;  ///< List of all elements connected to the node
  size_t _id;                        ///< Unique ID for each node
  std::string _name;                 ///< Unique name for each node
  size_t _num_elements;              ///< Number of elements connected to the node
  bool _is_ground;                   ///< Flag to indicate if the node is ground
  double _voltage;                   ///< Voltage of the node

public:
  /**
     * @brief Constructor for Node.
     * @param id Unique ID for the node.
     * @param name Unique name for the node.
     */
  Node(size_t id, std::string name);

  /**
     * @brief Destructor for Node.
     */
  ~Node();

  /**
     * @brief Adds an element to the node.
     * @param element Pointer to the element to be added.
     */
  void add_element(Element *element);

  /**
     * @brief Gets the number of elements connected to the node.
     * @return Number of elements connected to the node.
     */
  size_t num_elements() const;

  /**
     * @brief Gets the ID of the node.
     * @return ID of the node.
     */
  size_t id() const;

  /**
     * @brief Gets the name of the node.
     * @return Name of the node.
     */
  std::string name() const;

  /**
     * @brief Gets the elements connected to the node.
     * @return Vector of pointers to elements connected to the node.
     */
  std::vector<Element *> elements() const;

  /**
     * @brief Sets the node as ground.
     */
  void set_ground();

  /**
     * @brief Checks if the node is ground.
     * @return True if the node is ground, false otherwise.
     */
  bool is_ground() const;

  /**
     * @brief Gets the voltage of the node.
     * @return Voltage of the node.
     */
  double voltage() const;

  /**
     * @brief Sets the voltage of the node.
     * @param voltage Voltage to be set for the node.
     */
  void set_voltage(double voltage);
};
