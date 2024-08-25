// Solving circuits using MODIFIED NODAL ANALYSIS (MNA)
#include "./DC/Circuit.hpp"

// DOUBT: Should we accept both nodes once while entering elements? Answer: Yes or no
// TODO: Add current sources and dependent sources
// TODO: Add more error handling, optimize code
// TODO: Circuit should be read from txt file, design a parser and input format or a json parser and then use that to create circuit

int main()
{
  Circuit c = Circuit::create_from_json("./SRC/Circuit.json");
  c.solve();
  c.check();
}
