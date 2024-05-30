cc := g++
flags := -Wall -g -std=c++17 -Wextra -Wpedantic -Werror
Linker := -lm
Includes := -I./Include/
Libs := -L./Libs/
BuildDir := ./build

main: $(BuildDir)/main

$(BuildDir)/main: ./SRC/main.cpp
	mkdir -p $(BuildDir)
	$(cc) $(flags) $(Includes) $(Libs) ./SRC/main.cpp $(Linker) -o $(BuildDir)/main 

.PHONY: clean

clean:
	rm -rf $(BuildDir)
