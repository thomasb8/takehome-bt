# Adatbázis struktúra módosítás javaslatok

- A `cities` táblában a 9-es és a 10-es azonosítóhoz is Szombathely tartozik.
  Az importáló szkript a 10-es azonosítóhoz a túrkevei méréseket tölti be, ezért
  a 10-es város nevét Túrkevére kell javítani.
- A mérési táblákban nincs kulcs a város és a nap együttes azonosítására.
  A meglévő duplikátumok rendezése után a `(city_id, date)` összetett elsődleges
  kulcs megakadályozná az ismételt importból eredő duplikációt, és támogatná a
  városra és dátumtartományra szűrt lekérdezéseket. A `city_id` idegen kulccsal
  hivatkozhatna a `cities.id` mezőre.
- A dátumokat érdemes `DATE` típusban tárolni. Importáláskor a `-999` értékeket
  `NULL`-ra kell alakítani, hogy az átlagokban csak a mért értékek szerepeljenek.
