# Martian Robots Compiler

## Objective
The goal of this project is to design and implement a custom programming language for controlling robots on a grid, 
including the creation of a grammar, a compiler that translates programs written in this language into bytecode, 
and a virtual machine (VM) that executes the bytecode. The language should allow users to define a grid, specify robot movements and rotations, 
and handle edge cases such as robots moving off the grid.

## Requirements
1. **Grammar**: Design a grammar for the programming language that includes:
    - Definition of the grid size.
    - Definition of robots with their initial positions and orientations.
    - Instructions for moving and rotating robots.
2. **Compiler**: Implement a compiler that translates the source code written in the defined programming language into bytecode according to the provided bytecode specification.
3. **Virtual Machine**: Develop a virtual machine that executes the generated bytecode and outputs the final positions and states of the robots.

## Movement Logic
The surface of Mars is modeled by a rectangular grid. Robots can move and rotate based on instructions. Each robot has a position and an orientation:

1. **Position**: Represented by a pair of integers `(x, y)` indicating grid coordinates.
2. **Orientation**: Represented by one of the four cardinal directions (`N`, `S`, `E`, `W`).

Robots follow these instructions:
- **Left (`L`)**: Turns the robot 90 degrees to the left without changing its position.
- **Right (`R`)**: Turns the robot 90 degrees to the right without changing its position.
- **Forward (`F`)**: Moves the robot one grid point forward in its current orientation without changing the orientation.

The robot's movement logic is as follows:
- **North (`N`)**: Moving forward increases the `y` coordinate by 1.
- **East (`E`)**: Moving forward increases the `x` coordinate by 1.
- **South (`S`)**: Moving forward decreases the `y` coordinate by 1.
- **West (`W`)**: Moving forward decreases the `x` coordinate by 1.

If a robot moves off the edge of the grid, it is considered lost and leaves a "scent" at the last grid position it occupied before disappearing. Future robots will ignore move commands that would cause them to move off the grid from a scented position.

### Input Example
Sample program to be compiled:

```
Square 5 3

Carlos
Move 1 1 E
Rotate RFRFRFRF

Mike
Move 3 2 N
Rotate FRRFLLFFRRFLL

Jhon
Move 0 3 W
Rotate LLFFFLFLFL
```

#### Expected Output
The expected output of the VM after executing the bytecode:

```
Carlos: 1 1 E
Mike: 3 3 N LOST
Jhon: 2 3 S
```

## Deliverables
1. **Grammar Definition**: A formal grammar (using PEG.js or similar) defining the syntax of the programming language.
2. **Compiler**: A compiler that converts source code into bytecode following the specified bytecode format.
3. **Virtual Machine**: A virtual machine that reads the bytecode and executes the instructions, outputting the final positions and states of the robots.
4. **Documentation**: Documentation explaining the grammar, the structure of the compiler, and how the VM processes the bytecode. Include instructions on how to run the compiler and VM with sample inputs.

## Bonus
- Implement inter-process communication (IPC) to trigger signals ("MOVE", "ROTATE", etc.) that can be listened to by other processes, using either named pipes (FIFOs) or stdin.
- Include error handling for invalid instructions or edge cases (e.g., moving off the grid).
- Provide a set of unit tests for the compiler and the VM to ensure correctness.

## Submission
Submit your solution as a Git repository containing:
- Source code for the grammar, compiler, and virtual machine.
- Sample programs and their corresponding bytecode.
- Documentation and instructions for running the code.
- Unit tests for both the compiler and the VM.

## Evaluation Criteria
- Correctness: The solution correctly compiles the provided source code into bytecode and executes it to produce the expected output.
- Completeness: All required components (grammar, compiler, VM) are implemented and documented.
- Code Quality: The code is well-organized, readable, and follows best practices.
- Robustness: The solution handles edge cases and errors gracefully.
- Bonus: Additional features such as IPC and comprehensive tests are implemented.

## Bytecode Specification

#### General Structure
1. **Planet Definition**:
   - `0x01` - Indicates the start of the planet definition.
   - Two bytes follow for the width (`w`) and height (`h`) of the planet grid.

2. **Robot Instructions**:
   - Each robot's instructions are preceded by its name length and the name itself.
   - `0x80` - Indicates the end of a robot's instructions.

3. **Commands**:
   - `0x02` - Move command, followed by two bytes for `l` and `r` coordinates, and one byte for the direction.
   - `0x03` - Rotate command, followed by one or more bytes for rotations (R, L, F).

#### Direction and Rotation Encoding
- Directions:
  - `0x04` - North (`N`)
  - `0x05` - East (`E`)
  - `0x06` - South (`S`)
  - `0x07` - West (`W`)
- Rotations:
  - `0x08` - Right (`R`)
  - `0x09` - Forward (`F`)
  - `0x0A` - Left (`L`)

### Example Bytecode Generation Process

#### Step 1: Planet Definition

- **Width** and **Height** of the grid.
  - `Square 5 3` (width 5, height 3)
  
  Bytecode: `0x01 0x05 0x03`

#### Step 2: Robot Instructions

- **Robot Name**: `Carlos`
  - Length: `6`
  - Name in ASCII: `C a r l o s` -> `67 97 114 108 111 115`

  Bytecode: `0x06 0x43 0x61 0x72 0x6C 0x6F 0x73`

- **Instructions**:
  - **Move**: `Move 1 1 E`
    - `1 1 E` -> `1 1 0x05`
    
    Bytecode: `0x02 0x01 0x01 0x05`
    
  - **Rotate**: `RFRFRFRF`
    - `R F R F R F R F`
    
    Bytecode: `0x03 0x08 0x09 0x08 0x09 0x08 0x09 0x08 0x09`

  - End of Instructions
    
    Bytecode: `0x80`

### Complete Bytecode Example

Given the sample input:

```
Square 5 3

Carlos
Move 1 1 E
RFRFRFRF

Mike
Move 3 2 N
FRRFLLFFRRFLL

Jhon
Move 0 3 W
LLFFFLFLFL
```

The bytecode will be:

```
0x01 0x05 0x03       // Planet definition: 5x3 grid

0x06 0x43 0x61 0x72 0x6C 0x6F 0x73 // Robot name: Carlos
0x02 0x01 0x01 0x05  // Move: 1 1 E
0x03 0x08 0x09 0x08 0x09 0x08 0x09 0x08 0x09 // Rotate: RFRFRFRF
0x80                // End of instructions

0x04 0x4D 0x69 0x6B 0x65  // Robot name: Mike
0x02 0x03 0x02 0x04  // Move: 3 2 N
0x03 0x09 0x08 0x08 0x09 0x0A 0x0A 0x09 0x09 0x08 0x08 0x09 0x0A 0x0A // Rotate: FRRFLLFFRRFLL
0x80                // End of instructions

0x06 0x43 0x61 0x72 0x6C 0x6F 0x73 // Robot name: Jhon
0x02 0x00 0x03 0x07  // Move: 0 3 W
0x03 0x0A 0x0A 0x09 0x09 0x09 0x0A 0x09 0x0A 0x09 0x0A // Rotate: LLFFFLFLFL
0x80                // End of instructions
```

### Bytecode Breakdown

1. **Planet Definition**:
   - `0x01 0x05 0x03` - Planet grid of size 5x3.

2. **First Robot** - `Carlos`:
   - `0x06 0x43 0x61 0x72 0x6C 0x6F 0x73` - Robot name "Carlos".
   - `0x02 0x01 0x01 0x05` - Move to (1, 1) facing East.
   - `0x03 0x08 0x09 0x08 0x09 0x08 0x09 0x08 0x09` - Rotate sequence RFRFRFRF.
   - `0x80` - End of instructions.

3. **Second Robot** - `Mike`:
   - `0x04 0x4D 0x69 0x6B 0x65` - Robot name "Mike".
   - `0x02 0x03 0x02 0x04` - Move to (3, 2) facing North.
   - `0x03 0x09 0x08 0x08 0x09 0x0A 0x0A 0x09 0x09 0x08 0x08 0x09 0x0A 0x0A` - Rotate sequence FRRFLLFFRRFLL.
   - `0x80` - End of instructions.

4. **Third Robot** - `Carlos`:
   - `0x06 0x43 0x61 0x72 0x6C 0x6F 0x73` - Robot name "Carlos".
   - `0x02 0x00 0x03 0x07` - Move to (0, 3) facing West.
   - `0x03 0x0A 0x0A 0x09 0x09 0x09 0x0A 0x09 0x0A 0x09 0x0A` - Rotate sequence LLFFFLFLFL.
   - `0x80` - End of instructions.

### Conclusion

This bytecode specification can be used to generate the same bytecode with different grammars and compilers, ensuring consistent behavior in the VM.
By following this structure, you can ensure that your VM interprets and executes the bytecode correctly, triggering the appropriate signals and actions.

### Visual Example
![martian-robots](https://github.com/user-attachments/assets/2e0fe11c-3ec3-49bb-8bf5-70c3c8b84241)


