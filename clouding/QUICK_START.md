# 🚀 Desplegament PostgreSQL - Guia Ràpida

## ⚡ Desplegament des de Zero (GARANTIT)

```bash
# Al servidor
cd ~/serveis-extraordinaris
./clouding/start-fresh.sh
```

Aquest script:
- ✅ Elimina volums antics (garanteix que no hi ha restes)
- ✅ Inicia PostgreSQL des de zero
- ✅ Carrega l'schema automàticament (6 taules)
- ✅ Carrega dades seed (usuari admin, tipus de serveis)
- ✅ Verifica que tot funciona

---

## 🔧 Què s'ha Corregit?

### Problema Original
Docker només executa scripts d'inicialització si la base de dades està **completament buida**. Si el volum persisteix amb dades parcials o corruptes, no es reinicialitza.

### Solució
1. **Ruta schema.sql corregida** en docker-compose.yml
   - Abans: `../schema.sql` (incorrecte)
   - Ara: `./schema.sql` (correcte, està a l'arrel)

2. **Script `start-fresh.sh`** que sempre elimina volums abans d'iniciar
   - Força `docker compose down -v` (elimina volums)
   - Verifica eliminació
   - Reinicia des de zero

---

## 📋 Ús Normal (després de la primera instal·lació)

### Iniciar PostgreSQL
```bash
cd ~/serveis-extraordinaris
docker compose up -d
```

### Parar PostgreSQL
```bash
docker compose stop
```

### Reiniciar (manté dades)
```bash
docker compose restart
```

### Reiniciar des de zero (elimina dades)
```bash
./clouding/start-fresh.sh
```

---

## 🔍 Verificar Estat

```bash
cd ~/serveis-extraordinaris
./clouding/check-status.sh
```

Ha de mostrar:
- ✅ 6 taules creades
- ✅ Usuari admin present
- ✅ Tipus de serveis predefinits

---

## 📝 Estructura de Fitxers Esperada

```
~/serveis-extraordinaris/
├── docker-compose.yml       # Copiat de clouding/docker-compose.production.yml
├── .env                     # Copiat de clouding/.env.production
├── schema.sql              # Schema SQL (s'ha de veure!)
├── backups/                # Carpeta per backups
├── clouding/
│   ├── start-fresh.sh      # Iniciar des de zero
│   ├── check-status.sh     # Verificar estat
│   └── ...
└── ...
```

⚠️ **Important**: `schema.sql` ha d'estar a l'**arrel** del projecte!

---

## 🆘 Troubleshooting

### No es creen les taules

```bash
# Verificar que schema.sql existeix
ls -lh ~/serveis-extraordinaris/schema.sql

# Verificar ruta al docker-compose
grep "schema.sql" ~/serveis-extraordinaris/docker-compose.yml

# Ha de mostrar: ./schema.sql (no ../schema.sql)
```

### Volum persisteix amb dades antigues

```bash
# Solució: eliminar manualment
docker compose down -v
docker volume ls | grep serveis | awk '{print $2}' | xargs docker volume rm

# Tornar a iniciar
docker compose up -d
```

---

**Data**: 1 de desembre de 2025  
**Problema**: Resolt! Schema SQL es carrega correctament sempre
