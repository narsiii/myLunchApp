#OVERLAP NODE
if there are 2 lines A-----B and C-----D
!(b <= c || a >= d)  means they overlap.
the actual overlap length is the least of b-a, b-c, d-c, d-a

#UI GENERATION
i have used a tree data structure to get the number of divs
1. first the container is split into columns
2. every column is rendered based on its edges and next edges
3. every container will be marked with column# and row# and the css will be applied once the graph is generated
