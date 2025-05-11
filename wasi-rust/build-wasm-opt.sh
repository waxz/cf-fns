
if [ -z "$1" ]; then
echo please set target_dir;
fi;
if [ ! -d "$1" ]; then
    echo  target_dir $1 not found;
    fi;
find $1 -type f -name "*wasm" -print0 | while IFS= read -r -d $'\0' file; do   filename=$(basename "$file");   extension="${filename##*.}";   directory=$(dirname "$file");   echo "File: $file";   echo "Filename: $filename";   echo "Extension: $extension";   echo "Directory: $directory";   if [[ ! "$filename" == *"async_"* ]]; then wasm-opt $directory/$filename --asyncify -O3 -o $directory/async_$filename;fi ; done
