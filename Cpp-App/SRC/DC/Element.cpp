
#include "Element.hpp"

// Element class definitions

Element::Element(Type type, std::string name, double value)
    : _type(type), _name(std::move(name)), _pos_node(nullptr), _neg_node(nullptr), _value(value)
{
}

std::string Element::name() const { return _name; }

void Element::set_pos_node(Node *node)
{
    _pos_node = node;
    _pos_node->add_element(this);
}

Node *Element::get_pos_node() const { return _pos_node; }

void Element::set_neg_node(Node *node)
{
    _neg_node = node;
    _neg_node->add_element(this);
}

Node *Element::get_neg_node() const { return _neg_node; }

Node *Element::get_other_node(Node *node) const
{
    if (_pos_node == node)
    {
        return _neg_node;
    }
    else if (_neg_node == node)
    {
        return _pos_node;
    }
    return nullptr;
}

Type Element::type() const { return _type; }

double Element::value() const { return _value; }

// Resistor class definitions

Resistor::Resistor(std::string name, double resistance) : Element(Type::RESISTOR, std::move(name), resistance), _resistance(resistance) {}

double Resistor::resistance() const { return _resistance; }

void Resistor::set_resistance(double resistance) { _resistance = resistance; }

double Resistor::get_current() const
{
    return (get_pos_node() && get_neg_node()) ? -1 * ((get_pos_node()->voltage() - get_neg_node()->voltage()) / _resistance) : 0.0;
}

// VoltageSource class definitions

VoltageSource::VoltageSource(std::string name, double voltage, int id)
    : Element(Type::VOLTAGE_SUPPLY, std::move(name), voltage), _voltage(voltage), _volt_source_id(id)
{
}

double VoltageSource::voltage() const { return _voltage; }

void VoltageSource::set_voltage(double voltage) { _voltage = voltage; }

double VoltageSource::get_current() const { return _current; }

void VoltageSource::set_current(double current) { _current = current; }

int VoltageSource::id() const { return _volt_source_id; }

// CurrentSource class definitions

CurrentSource::CurrentSource(std::string name, double current, int id)
    : Element(Type::CURRENT_SOURCE, std::move(name), current), _current(current), _current_source_id(id)
{
}

double CurrentSource::current() const { return _current; }

int CurrentSource::id() const { return _current_source_id; }
