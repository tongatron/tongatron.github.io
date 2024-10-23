import os
import hashlib

def hash_file(path, blocksize=65536):
    hasher = hashlib.md5()
    try:
        with open(path, 'rb') as afile:
            buf = afile.read(blocksize)
            while len(buf) > 0:
                hasher.update(buf)
                buf = afile.read(blocksize)
        return hasher.hexdigest()
    except:
        return None

def find_duplicates(start_dirs):
    hashes = {}
    for dir in start_dirs:
        for root, _, files in os.walk(dir):
            for name in files:
                filepath = os.path.join(root, name)
                filehash = hash_file(filepath)
                if filehash:
                    if filehash in hashes:
                        hashes[filehash].append(filepath)
                    else:
                        hashes[filehash] = [filepath]
    duplicates = []
    for file_list in hashes.values():
        if len(file_list) > 1:
            duplicates.append(file_list)
    return duplicates

def get_file_size(filepath):
    return os.path.getsize(filepath)

def main():
    start_dirs = [input("Inserisci il percorso della directory da analizzare: ")]
    duplicates = find_duplicates(start_dirs)
    duplicates_with_size = []
    for file_list in duplicates:
        size = get_file_size(file_list[0])
        duplicates_with_size.append((size, file_list))
    duplicates_with_size.sort(reverse=True)

    for idx, (size, files) in enumerate(duplicates_with_size):
        print(f"\nGruppo {idx+1} (Dimensione: {size} bytes):")
        for i, file in enumerate(files):
            print(f"  {i+1}. {file}")

    while True:
        choice = input("\nVuoi cancellare dei file duplicati? (s/n): ").lower()
        if choice == 's':
            group_num = int(input("Inserisci il numero del gruppo: ")) - 1
            file_num = int(input("Inserisci il numero del file da cancellare: ")) - 1
            file_to_delete = duplicates_with_size[group_num][1][file_num]
            os.remove(file_to_delete)
            print(f"File {file_to_delete} cancellato.")
            # Rimuovi il file dalla lista
            duplicates_with_size[group_num][1].pop(file_num)
            if len(duplicates_with_size[group_num][1]) <= 1:
                duplicates_with_size.pop(group_num)
        else:
            break

if __name__ == "__main__":
    main()