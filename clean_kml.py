from sys import argv
from re import sub
x, input, output = argv
txt = open(input).read();
newtxt = sub('\t*<SimpleData name="((?!(TRACT|BLKGRP)).)*">.*<\/SimpleData>\n', "", txt);
newtxt = sub('\t*<SimpleField name="((?!(TRACT|BLKGRP)).)*" type=".*"><\/SimpleField>\n', "", newtxt);
output_file = open(output, "w")
output_file.write(newtxt)
output_file.close();
