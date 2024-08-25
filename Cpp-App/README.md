# Circuit Solver

## Table of Contents

1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
   - [Node](#node)
   - [Element](#element)
   - [Circuit](#circuit)
4. [Implementation Details](#implementation-details)
   - [Modified Nodal Analysis (MNA)](#modified-nodal-analysis-mna)
   - [Matrix Construction](#matrix-construction)
   - [Solving the System](#solving-the-system)
5. [Usage](#usage)
6. [Compilation](#compilation)
7. [Contributing](#contributing)
8. [Future Enhancements](#future-enhancements)

## Introduction

This project implements a circuit solver using Modified Nodal Analysis (MNA). It can analyze DC circuits containing resistors, voltage sources, and current sources. The solver constructs a system of linear equations representing the circuit and solves them to determine node voltages and branch currents.

## Project Structure

```bash
├── INFO.md
├── Makefile
├── README.md
└── SRC
├── DC
│ ├── Circuit.cpp
│ ├── Circuit.hpp
│ ├── Element.cpp
│ ├── Element.hpp
│ ├── Node.cpp
│ └── Node.hpp
└── main.cpp
```

- `INFO.md`: Additional information about the project
- `Makefile`: Compilation instructions
- `README.md`: This file
- `SRC/`: Source code directory
  - `DC/`: DC circuit analysis components
  - `main.cpp`: Main entry point of the program

## Core Components

### Node

Represents a node in the circuit. Each node has:

- A unique ID
- A name
- A voltage (calculated during solving)
- A flag indicating if it's a ground node

### Element

Base class for circuit elements. Subclasses include:

- `Resistor`
- `VoltageSource`
- `CurrentSource`

Each element has:

- A name
- A value (resistance, voltage, or current)
- Pointers to positive and negative nodes

### Circuit

Main class that represents the entire circuit. It contains:

- A list of nodes
- A list of elements
- Methods for adding nodes and elements
- The solving algorithm

## Implementation Details

### Modified Nodal Analysis (MNA)

  [Primary source](/Cpp-App/INFO.md)

The solver uses MNA, which is an extension of Nodal Analysis that can handle voltage sources and current sources. The basic steps are:

1. Assign a reference node (ground)
2. Define unknown node voltages
3. Define unknown currents through voltage sources
4. Apply Kirchhoff's Current Law (KCL) at each node
5. Add equations for voltage sources
6. Solve the resulting system of linear equations

### Matrix Construction

The solver constructs two matrices:

1. Coefficient matrix (A)
2. Right-hand side vector (Z)

The coefficient matrix A is constructed as follows:

- Upper-left submatrix: Conductance matrix (G)
- Upper-right and lower-left submatrices: Connection matrices for voltage sources
- Lower-right submatrix: Zeros

The Z vector contains:

- Known currents for each node
- Known voltages for voltage sources

### Solving the System

The system AX = Z is solved using the Eigen library, where X is the vector of unknown node voltages and branch currents.

## Usage

To use the circuit solver:

1. Create a `Circuit` object
2. Add nodes using `add_node()`
3. Add elements (resistors, voltage sources, current sources) using respective methods
4. Call the `solve()` method
5. Retrieve results (node voltages and branch currents)

Example:

```cpp
int main()
{
  Circuit c;
  c.add_node("N1");
  c.add_node("N2");
  c.add_v_source("V1", "N1", 10);
  c.add_v_source("V1", "N2", -10);
  c.add_resistor("R1", "N1", 5);
  c.add_resistor("R1", "N2", 5);
  c.solve();
  // Retrieve and display results
}
```


## Compilation

Use the provided Makefile to compile the project:
```bash
make clean
make main
make run
```
This will generate an executable in the project root directory.

## Contributing
Contributions are welcome! Here are some areas where you can contribute:

Implement AC circuit analysis
Add support for more circuit elements (capacitors, inductors, diodes, transistors)
Improve error handling and input validation
Optimize the solving algorithm for large circuits
Implement a graphical user interface for circuit design and result visualization
Add unit tests and improve code coverage
Enhance documentation and code comments

Before contributing, please read the CONTRIBUTING.md file (if available) for guidelines on code style, commit messages, and the pull request process.

## Future Enhancements

Support for AC circuit analysis
Transient analysis capabilities
Frequency response analysis
Support for non-linear circuit elements
Parallel processing for large circuit matrices
Integration with SPICE models for more accurate device modeling
