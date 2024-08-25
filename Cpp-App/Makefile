cc := g++
flags := -Wall -g -std=c++20 -Wextra -Wpedantic -Werror -ggdb
Linker := -lm
Includes := -I./Include/
Libs := -L./Libs/
BuildDir := ./build
DcDir := ./SRC/DC

debug: $(BuildDir)/main
	gdb $(BuildDir)/main

main: $(BuildDir)/main

$(BuildDir)/Circuit.o: $(DcDir)/Circuit.cpp
	mkdir -p $(BuildDir)
	$(cc) $(flags) $(Includes) $(Libs) -c $(DcDir)/Circuit.cpp -o $(BuildDir)/Circuit.o

$(BuildDir)/Element.o: $(DcDir)/Element.cpp
	mkdir -p $(BuildDir)
	$(cc) $(flags) $(Includes) $(Libs) -c $(DcDir)/Element.cpp -o $(BuildDir)/Element.o

$(BuildDir)/Node.o: $(DcDir)/Node.cpp
	mkdir -p $(BuildDir)
	$(cc) $(flags) $(Includes) $(Libs) -c $(DcDir)/Node.cpp -o $(BuildDir)/Node.o

$(BuildDir)/main.o: ./SRC/main.cpp
	mkdir -p $(BuildDir)
	$(cc) $(flags) $(Includes) $(Libs) -c ./SRC/main.cpp -o $(BuildDir)/main.o

$(BuildDir)/main: $(BuildDir)/main.o $(BuildDir)/Circuit.o $(BuildDir)/Element.o $(BuildDir)/Node.o 
	$(cc) $(flags) $(Includes) $(Libs) $(BuildDir)/main.o $(BuildDir)/Circuit.o $(BuildDir)/Element.o $(BuildDir)/Node.o $(Linker) -o $(BuildDir)/main

.PHONY: clean

clean:
	rm -rf $(BuildDir)

run: $(BuildDir)/main
	./$(BuildDir)/main
