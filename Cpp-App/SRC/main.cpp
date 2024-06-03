// Solving circuits using MODIFIED NODAL ANALYSIS (MNA)
#include "./DC/Circuit.hpp"

//DOUBT: Should we accept both nodes once while entering elements? Answer: Yes or no
//TODO: Add current sources and dependent sources
//TODO: Add more error handling, optimize code
//TODO: Circuit should be read from txt file, design a parser and input format or a json parser and then use that to create circuit

int main()
{
    Circuit c;

    c.add_node("N1");
    c.add_node("N2");
    c.add_node("N3");

    c.add_c_source("C1", "N1", 1);
    c.add_c_source("C1", "N2", -1);

    c.add_resistor("R1", "N1", 1);
    c.add_resistor("R1", "N2", 1);
    c.add_resistor("R2", "N2", 1);
    c.add_resistor("R2", "N3", 1);
    c.solve();
    c.check();
}