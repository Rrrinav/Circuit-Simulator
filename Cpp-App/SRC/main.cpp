// Solving circuits using MODIFIED NODAL ANALYSIS (MNA)
#include "./DC/Circuit.hpp"

// DOUBT: Should we accept both nodes once while entering elements? Answer: Yes or no
// TODO: Add current sources and dependent sources
// TODO: Add more error handling, optimize code
// TODO: Circuit should be read from txt file, design a parser and input format or a json parser and then use that to create circuit

int main()
{
  Circuit c;
  c.add_node("N1");
  c.add_node("N2");
  c.add_node("N3");
  c.add_v_source("V1", "N1", 12);
  c.add_v_source("V1", "N3", -12);
  c.add_c_source("I1", "N2", 2);
  c.add_c_source("I1", "N3", -2);
  c.add_resistor("R1", "N1", 4);
  c.add_resistor("R1", "N2", 4);
  c.add_resistor("R2", "N2", 6);
  c.add_resistor("R2", "N3", 6);
  c.solve();
  c.check();
}
