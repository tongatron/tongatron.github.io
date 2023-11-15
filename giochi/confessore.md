Confessore



```python
def risposta_peccato(peccato):
    # Categorie di peccati (solo esempi ipotetici)
    peccati_veniali = ["essere stato geloso", "aver detto una bugia leggera"]
    peccati_veniali_critici = ["aver perso la pazienza", "aver ignorato un amico in difficoltà"]
    peccati_gravi = ["aver rubato qualcosa", "aver fatto del male a qualcuno intenzionalmente"]

    # Controllo del peccato e risposta corrispondente
    if peccato in peccati_veniali:
        return "ci sta"
    elif peccato in peccati_veniali_critici:
        return "non ci sta, ma alla fine ci sta"
    elif peccato in peccati_gravi:
        return "non ci sta"
    else:
        return "Non sono in grado di giudicare questo. Parla con un sacerdote."

# Esempi di utilizzo:
print(risposta_peccato("essere stato geloso")) # Output: "ci sta"
print(risposta_peccato("aver perso la pazienza")) # Output: "non ci sta, ma alla fine ci sta"
print(risposta_peccato("aver rubato qualcosa")) # Output: "non ci sta"

```

