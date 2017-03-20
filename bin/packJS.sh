#!/bin/bash
FILE=$1

if [ -f "$FILE.min.js" ];
then
   echo "Removed existing $FILE.min.js"
   rm -f "$FILE.min.js"
fi

cat *.js >> "$FILE.min.js"
java -jar ./yuicompressor-2.4.8.jar "$FILE.min.js" -o "$FILE.min.js"
echo "Created minified version of $FILE -> $FILE.min.js"
