#pragma once

#include <string>

#include "Node.hpp"

/**
 * @enum Type
 * @brief Enumeration for the types of electrical elements.
 */
enum class Type
{
    VOLTAGE_SUPPLY,
    RESISTOR,
    CURRENT_SOURCE,
    DEPENDENT_VOLTAGE_SOURCE,
    DEPENDENT_CURRENT_SOURCE,
};

/**
 * @class Element
 * @brief Base class for all electrical elements.
 */
class Element
{
private:
    Type _type;         ///< Type of the element
    std::string _name;  ///< Name of the element
    Node *_pos_node;    ///< Positive node
    Node *_neg_node;    ///< Negative node
    double _value;      ///< Value associated with the element

public:
    /**
     * @brief Constructor for Element.
     * @param type Type of the element.
     * @param name Name of the element.
     * @param value Value associated with the element.
     */
    Element(Type type, std::string name, double value);

    /**
     * @brief Virtual destructor for Element.
     */
    virtual ~Element() = default;

    /**
     * @brief Gets the name of the element.
     * @return Name of the element.
     */
    std::string name() const;

    /**
     * @brief Sets the positive node.
     * @param node Pointer to the positive node.
     */
    void set_pos_node(Node *node);

    /**
     * @brief Gets the positive node.
     * @return Pointer to the positive node.
     */
    Node *get_pos_node() const;

    /**
     * @brief Sets the negative node.
     * @param node Pointer to the negative node.
     */
    void set_neg_node(Node *node);

    /**
     * @brief Gets the negative node.
     * @return Pointer to the negative node.
     */
    Node *get_neg_node() const;

    /**
     * @brief Gets the other node connected to this element.
     * @param node Pointer to the known node.
     * @return Pointer to the other node.
     */
    Node *get_other_node(Node *node) const;

    /**
     * @brief Gets the type of the element.
     * @return Type of the element.
     */
    Type type() const;

    /**
     * @brief Gets the value associated with the element.
     * @return Value of the element.
     */
    double value() const;
};

/**
 * @class Resistor
 * @brief Class representing a resistor element.
 */
class Resistor : public Element
{
private:
    double _resistance;  ///< Resistance value

public:
    /**
     * @brief Constructor for Resistor.
     * @param name Name of the resistor.
     * @param resistance Resistance value.
     */
    Resistor(std::string name, double resistance);

    /**
     * @brief Gets the resistance value.
     * @return Resistance value.
     */
    double resistance() const;

    /**
     * @brief Sets the resistance value.
     * @param resistance New resistance value.
     */
    void set_resistance(double resistance);

    /**
     * @brief Calculates the current through the resistor.
     * @return Current through the resistor.
     */
    double get_current() const;
};

/**
 * @class VoltageSource
 * @brief Class representing a voltage source element.
 */
class VoltageSource : public Element
{
private:
    double _voltage;      ///< Voltage value
    double _current;      ///< Current value
    int _volt_source_id;  ///< Voltage source identifier

public:
    /**
     * @brief Constructor for VoltageSource.
     * @param name Name of the voltage source.
     * @param voltage Voltage value.
     * @param id Voltage source identifier.
     */
    VoltageSource(std::string name, double voltage, int id);

    /**
     * @brief Gets the voltage value.
     * @return Voltage value.
     */
    double voltage() const;

    /**
     * @brief Sets the voltage value.
     * @param voltage New voltage value.
     */
    void set_voltage(double voltage);

    /**
     * @brief Gets the current value.
     * @return Current value.
     */
    double get_current() const;

    /**
     * @brief Sets the current value.
     * @param current New current value.
     */
    void set_current(double current);

    /**
     * @brief Gets the voltage source identifier.
     * @return Voltage source identifier.
     */
    int id() const;
};

/**
 * @class CurrentSource
 * @brief Class representing a current source element.
 */
class CurrentSource : public Element
{
private:
    double _current;         ///< Current value
    int _current_source_id;  ///< Current source identifier

public:
    /**
     * @brief Constructor for CurrentSource.
     * @param name Name of the current source.
     * @param current Current value.
     * @param id Current source identifier.
     */
    CurrentSource(std::string name, double current, int id);

    /**
     * @brief Gets the current value.
     * @return Current value.
     */
    double current() const;

    /**
     * @brief Gets the current source identifier.
     * @return Current source identifier.
     */
    int id() const;
};
