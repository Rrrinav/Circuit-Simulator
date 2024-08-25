#include <fstream>
#include <iostream>

#include "../Include/nlohmann/json.hpp"

using json = nlohmann::json;

int main(void)
{
  std::ifstream f("./Circuit.json");
  json j = json::parse(f);

  auto nodes = j["nodes"];

  for (auto &node : nodes)
  {
    std::string name = node["name"];
    std::cout << name << '\n';
  }

  std::cout << "Elements\n";
  auto elements = j["elements"];
  for (auto &element : elements)
  {
    std::string name = element["name"];
    std::string type = element["type"];
    std::cout << name << '\t' << type << '\n';
  }
}
