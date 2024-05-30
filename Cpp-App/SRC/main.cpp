// Solving circuits using MODIFIED NODAL ANALYSIS (MNA)

#include <cmath>
#include <cstddef>
#include <iostream>
#include <string>
#include <vector>

#include "../Include/Eigen/Dense"

enum class Type
{
    VOLTAGE_SUPPLY,
    RESISTOR,
};


enum class properties
{
    VOLTAGE,
    CURRENT,
    RESISTANCE,
};

class Element;

class Node
{
private:
    std::vector<Element *> _elements;  // List of all elements connected to the node
    size_t _id;                        // Unique id for each node
    std::string _name;                 // Unique name for each node
    size_t _num_elements;              // Num of elements connected to the node
    bool _is_ground;                   // If node is ground or not
    double _voltage;                   // voltage of the node

public:
    Node(size_t id, std::string name) : _id(id), _name(name), _num_elements(0)
    {
        _is_ground = false;
        _voltage = 0.0;
    }

    ~Node() {}

    void add_element(Element *element)
    {
        _elements.push_back(element);
        _num_elements++;
    }

    size_t num_elements() const { return _num_elements; }

    size_t id() const { return _id; }

    std::string name() const { return _name; }

    std::vector<Element *> elements() const { return _elements; }

    void set_ground() { _is_ground = true; }
    bool is_ground() const { return _is_ground; }

    double voltage() const { return _voltage; }
    void set_voltage(double voltage) { _voltage = voltage; }
};

class Element
{
    Type _type;
    std::string _name;
    Node *_pos_node;
    Node *_neg_node;
    double _value;

public:
    Element(Type type, std::string name, double value) : _type(type), _name(name), _pos_node(nullptr), _neg_node(nullptr), _value(value) {}

    std::string name() const { return _name; }

    void set_pos_node(Node *node)
    {
        _pos_node = node;
        _pos_node->add_element(this);
    }
    Node *get_pos_node() { return _pos_node; }

    void set_neg_node(Node *node)
    {
        _neg_node = node;
        _neg_node->add_element(this);
    }
    Node *get_neg_node() { return _neg_node; }

    Node *get_other_node(Node *node)
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

    Type type() const { return _type; }

    double value() const { return _value; }
};

class Resistor : public Element
{
    double _resistance;  // Resistance value

public:
    // Constructor that initializes the resistor with its name and resistance value (nodes can be set later)
    Resistor(std::string name, double resistance) : Element(Type::RESISTOR, name, resistance), _resistance(resistance) {}

    // Getter for resistance value
    double resistance() const { return _resistance; }

    // Setter for resistance value
    void set_resistance(double resistance) { _resistance = resistance; }

    double get_current() { return -1 * ((get_pos_node()->voltage() - get_neg_node()->voltage()) / _resistance); }
};

class VoltageSource : public Element
{
    double _voltage;  // Voltage value
    double _current;  // Current value
    int _volt_source_id;

public:
    // Constructor that initializes the voltage source with its name and voltage value (nodes can be set later)
    VoltageSource(std::string name, double voltage, int id)
        : Element(Type::VOLTAGE_SUPPLY, name, voltage), _voltage(voltage), _volt_source_id(id)
    {
    }

    // Getter for voltage value
    double voltage() const { return _voltage; }

    // Setter for voltage value
    void set_voltage(double voltage) { _voltage = voltage; }

    double get_current() { return _current; }
    void set_current(double current) { _current = current; }

    int id() const { return _volt_source_id; }
};

class Circuit
{
    std::vector<Node *> _nodes;
    std::vector<Element *> _elements;
    std::vector<VoltageSource *> _voltage_sources;
    size_t _volt_source_id;
    size_t _node_id;
    Node *_ground;

public:
    Circuit() : _volt_source_id(0), _node_id(0) {}

    ~Circuit()
    {
        for (auto node : _nodes)
        {
            delete node;
        }
        for (auto element : _elements)
        {
            delete element;
        }
    }

    void add_node(std::string name) { _nodes.push_back(new Node(_node_id++, name)); }

    Node *get_node(std::string name)
    {
        for (auto node : _nodes)
        {
            if (node->name() == name)
            {
                return node;
            }
        }
        return nullptr;
    }

    Element *get_element(std::string name)
    {
        for (auto element : _elements)
        {
            if (element->name() == name)
            {
                return element;
            }
        }
        return nullptr;
    }

    VoltageSource *get_voltage_source(std::string name)
    {
        for (auto element : _voltage_sources)
        {
            if (element->name() == name)
            {
                return static_cast<VoltageSource *>(element);
            }
        }
        return nullptr;
    }

    //We will add resistor based on criteria if pos node is set, we set neg node and vice-versa
    void add_resistor(std::string name, std::string node_name, double value)
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
            {
                resistor->set_neg_node(node);
            }
            else
            {
                std::cerr << "Error: Resistor " << name << " already has both nodes assigned or value mismatch\n";
            }
        }
        else
        {
            std::cerr << "Error: Element " << name << " is not a resistor\n";
        }
    }

    //We will add source based on criteria if value is -ve or +ve, is value is -ve node is neg_node and vice-versa
    void add_v_source(std::string name, std::string node_name, double value)
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
            {
                v_source->set_neg_node(node);
            }
            else
            {
                v_source->set_pos_node(node);
            }
            _elements.push_back(v_source);
            _voltage_sources.push_back(v_source);
        }
        else if (v_source->type() == Type::VOLTAGE_SUPPLY)
        {
            // If voltage source is present and its type is VOLTAGE_SUPPLY
            // If pos node is set and value is -ve, set neg node; if neg node is set and value is +ve, set pos node
            if (v_source->get_pos_node() != nullptr && v_source->get_neg_node() == nullptr && value < 0)
            {
                v_source->set_neg_node(node);
            }
            else if (v_source->get_pos_node() == nullptr && v_source->get_neg_node() != nullptr && value > 0)
            {
                v_source->set_pos_node(node);
            }
            else
            {
                std::cerr << "Error: Voltage source " << name << " already has both nodes assigned or value mismatch\n";
            }
        }
        else
        {
            std::cerr << "Error: Element " << name << " is not a voltage source\n";
        }
    }

    //We will set neg_node of last voltage source as ground node and set its voltage to 0
    Node *set_ground()
    {
        VoltageSource *v_source = static_cast<VoltageSource *>(_voltage_sources.back());
        v_source->get_neg_node()->set_ground();
        v_source->get_neg_node()->set_voltage(0);
        _ground = v_source->get_neg_node();
        return _ground;
    }

    //Temporary function to check if all nodes and resistors are connected properly
    void check()
    {
        std::cout << "Nodes: \n";
        for (auto node : _nodes)
        {
            if (node->elements().empty())
            {
                std::cerr << "Node: " << node->name() << " has no elements\n";
            }
            std::cout << "Node: " << node->name() << " (ID: " << node->id() << ") Voltage: " << node->voltage() << "\n";
            std::cout << "Elements: ";
            for (auto element : node->elements())
            {
                std::cout << element->name() << " ";
            }
            std::cout << "\n";
        }

        std::cout << "Elements: \n";
        for (auto element : _elements)
        {
            if (element->get_neg_node() == nullptr || element->get_pos_node() == nullptr)
            {
                std::cerr << "Element: " << element->name() << " has missing nodes\n";
            }
            std::cout << "Element: " << element->name() << " Pos Node: " << element->get_pos_node()->name()
                      << " Neg Node: " << element->get_neg_node()->name() << "\n";
        }

        std::cout << "Voltage Sources: \n";
        for (auto element : _voltage_sources)
        {
            if (element->get_neg_node() == nullptr || element->get_pos_node() == nullptr)
            {
                std::cerr << "Element: " << element->name() << " has missing nodes\n";
            }
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
    void solve()
    {
        size_t num_nodes = _nodes.size() - 1;  //Removing ground node
        size_t num_voltage_sources = _voltage_sources.size();
        Eigen::MatrixXd A;
        Eigen::VectorXd X;
        Eigen::VectorXd Z;

        set_ground();

        fill_matrix_A(A, num_nodes, num_voltage_sources);
        //Print A matrix
        for (size_t i = 0; i < num_nodes + num_voltage_sources; i++)
        {
            for (size_t j = 0; j < num_nodes + num_voltage_sources; j++)
            {
                std::cout << A(i, j) << "     ";
            }
            std::cout << "\n";
        }
        //We don't need to fill X as we are solving for it
        X = Eigen::VectorXd::Zero(num_nodes + num_voltage_sources);
        fill_vector_Z(Z, num_nodes, num_voltage_sources);
        for (size_t i = 0; i < num_nodes + num_voltage_sources; i++)
        {
            std::cout << Z(i) << " ";
        }
        if (solve_for_x(A, X, Z))
        {
            std::cout << "Solution found\n";
        }
        else
        {
            std::cerr << "Solution not found\n";
        }
    }

private:
    void fill_matrix_A(Eigen::MatrixXd &A, size_t num_nodes, size_t num_voltage_sources)
    {
        A = Eigen::MatrixXd::Zero(num_nodes + num_voltage_sources, num_nodes + num_voltage_sources);

        // Precompute conductances for resistors
        std::unordered_map<Element *, double> resistor_conductances;
        for (auto node : _nodes)
        {
            for (auto node_elem : node->elements())
            {
                if (node_elem->type() == Type::RESISTOR)
                {
                    resistor_conductances[node_elem] = 1.0 / node_elem->value();
                }
            }
        }

        for (auto node : _nodes)
        {
            //We ignore ground nod
            if (node->is_ground())
            {
                continue;
            }

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
                        {
                            A(node->id(), other_node->id()) -= 1 / conductance;
                        }
                        else
                        {
                            A(node->id(), other_node->id()) = -1 / solve_parallel(node, other_node);
                        }
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

    void fill_vector_Z(Eigen::VectorXd &Z, size_t num_nodes, size_t num_voltage_sources)
    {
        Z = Eigen::VectorXd::Zero(num_nodes + num_voltage_sources);
        for (auto voltage_source : _voltage_sources)
        {
            VoltageSource *v_source = static_cast<VoltageSource *>(voltage_source);
            Z(num_nodes + v_source->id()) = v_source->voltage();
        }
    }

    //We have set of simultaneous equations to solve for X
    //We will just use Eigen to solve AX = Z and fill resultant X values to nodes and voltage sources
    bool solve_for_x(Eigen::MatrixXd &A, Eigen::VectorXd &X, Eigen::VectorXd &Z)
    {
        X = A.colPivHouseholderQr().solve(Z);
        std::cout << '\n';
        for (int i = 0; i < X.size(); i++)
        {
            std::cout << X(i) << " ";
        }
        size_t num_nodes = _nodes.size() - 1;
        for (auto node : _nodes)
        {
            if (!node->is_ground())
            {
                node->set_voltage(X(node->id()));
            }
        }
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
        {
            if (elem->get_other_node(node_1) == node_2)
            {
                num++;
            }
        }
        return num;
    }
};

//HACK: Should we accept both nodes once while entering elements?
//TODO: Add current sources and dependent sources
//TODO: Add more error handling, optimize code
//TODO: Circuit should be read from txt file, design a parser and input format or a json parser and then use that to create circuit

int main()
{
    Circuit c;

    c.add_node("N1");
    c.add_node("N2");
    c.add_node("N3");
    c.add_node("N4");

    c.add_v_source("V1", "N1", 10.0);
    c.add_v_source("V1", "N4", -10.0);

    c.add_resistor("R1", "N1", 1.0);
    c.add_resistor("R1", "N2", 1.0);
    c.add_resistor("R2", "N2", 1.0);
    c.add_resistor("R2", "N3", 1.0);
    c.add_resistor("R3", "N2", 1.0);
    c.add_resistor("R3", "N3", 1.0);
    c.add_resistor("R4", "N3", 1.0);
    c.add_resistor("R4", "N4", 1.0);

    c.solve();
    c.check();
}
