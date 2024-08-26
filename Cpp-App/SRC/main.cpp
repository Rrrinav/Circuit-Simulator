// Solving circuits using MODIFIED NODAL ANALYSIS (MNA)
#include "./DC/Circuit.hpp"

// TODO: Add both nodes at once
// DOUBT: I am not sure if I should add both nodes at once or not but we'll see after developing frontend
// TODO: Add current sources and dependent sources
// TODO: Add more error handling, optimize code and add more error messages

int main()
{
  Circuit c = Circuit::create_from_json("./SRC/Circuit.json");
  c.solve();
  c.check();
}
