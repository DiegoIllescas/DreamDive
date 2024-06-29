const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Augosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const today = new Date();
const month = today.getMonth();
const year = today.getFullYear();

let monthContainer = document.getElementById('month');
monthContainer.textContent = monthNames[month];

const tablaDias = document.getElementById('dias');

function cargarMes(month, year) {
    tablaDias.innerHTML = "<thead><tr><th>D</th><th>L</th><th>M</th><th>M</th><th>J</th><th>V</th><th>S</th></tr></thead><tbody></tbody>";

    const date = new Date(year, month, 1);
    const fisrtDay = date.getDay();

    let dia = 1;
    let table = document.querySelector('tbody');
    let fila = document.createElement('tr');
    const numDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    
    const monthdays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    console.log(numDay);

    table.appendChild(fila);
    let i = 0;

    for(i = 0; i < fisrtDay; i++) {
        let day = document.createElement('td');
        day.textContent = numDay - fisrtDay + i + 1;
        fila.appendChild(day);
    }

    while(dia <= monthdays) {
        const newCell = document.createElement('td');
        newCell.textContent = dia;

        if(dia == new Date().getDate() && month == new Date().getMonth() && year == new Date().getFullYear()) {
            newCell.classList.add('today');
        }

        if(i == 7) {
            fila = document.createElement('tr');
            table.appendChild(fila);
            i = 0;
        }

        fila.appendChild(newCell);

        console.log(i);
        i++
        dia++;
    }

    let daysleft = 7 - i;
    for(i = 1; i <= daysleft; i++) {
        let day = document.createElement('td');
        day.textContent = i;
        fila.appendChild(day);
    }
}

cargarMes(month, year);

const eventos = [
    {
        nombre: "Sala de Lectura",
        lugar: "El Rule Comunidad de Saberes",
        descripcion: "Se realizarán lecturas en voz alta, narraciones, talleres y juegos de mesa para fomentar la convivencia en la comunidad. La temática de esta semana son: 'Caperucita roja' Actividad: Pizarrón de frases amigables",
        costo: "Gratuito",
        fecha: "2024-06-27",
        hora: "16:00 horas",
        ubicacion: "Eje Central Lázaro Cárdenas 6 , Centro (Área 1), Cuauhtémoc, C.P. 06000, Ciudad de México"
    },
    {
      nombre: "Segundo Picnic Literario",
      lugar: "FARO Tláhuac",
      descripcion: "Jornada de actividades y talleres relacionadas a la literatura relacionadas con el cuidado y preservación del medio ambiente",
      costo: "Gratuito",
      fecha: "2024-06-28",
      hora: "00:00 horas",
      ubicacion: "Av. La Turba 15 , Miguel Hidalgo, Tláhuac, C.P. 13200, Ciudad de México"
    },
    {
      nombre: "Club de lectura",
      lugar: "Museo del Telégrafo",
      descripcion: "Te invitamos a conocer autoras y autores contemporáneos en nuestro club de lectura del museo.",
      costo: "Gratuito",
      fecha: "2024-06-28",
      hora: "13:00 horas",
      ubicacion: "Calle de Tacuba 8 , Centro (Área 2), Cuauhtémoc, C.P. 06010, Ciudad de México"
    },
    {
        nombre: "Noche con orgullo",
        lugar: "Museo del Telégrafo",
        descripcion: "Te invitamos a conocer la poesía lésbica de Aketzaly Moreno y Yadira del Mar.",
        costo: "Gratuito",
        fecha: "2024-06-28",
        hora: "16:00 horas",
        ubicacion: "Calle de Tacuba 8 , Centro (Área 2), Cuauhtémoc, C.P. 06010, Ciudad de México"
    },
    {
        nombre: "¿Quieres que te lo lea otra vez? - El libro de los seres imaginarios, Jorge Luis Borges",
        lugar: "Palacio de Bellas Artes",
        descripcion: "Lectura en voz alta con cuentos de El libro de los seres imaginarios de Jorge Luis Borges.",
        costo: "Gratuito",
        fecha: "2024-07-29",
        hora: "12:00 horas",
        ubicacion: "Av. Juárez S/N , Centro (Área 5), Cuauhtémoc, C.P. 06050, Ciudad de México"
    },
    {
        nombre: "Programa radial Libro Clubes al Aire",
        lugar: "Código 21 | Radio Cultural en Línea CDMX",
        descripcion: "Programa de radio dedicado a difundir la importante labor de los Libro Clubes de la Ciudad de México. Se transmite por Código 21 y en formato audiovisual a través del Facebook de la Red de Libro Clubes de la Ciudad de México.",
        costo: "Gratuito",
        fecha: "2024-07-30",
        hora: "11:00 horas",
        ubicacion: "Moras 533 , Del Valle Centro, Benito Juárez, C.P. 03100, Ciudad de México"
    },
    {
        nombre: "Memorias de un poeta nómada, cómo vivir de la poesía y disfrutar en el intento",
        lugar: "Centro Cultural José Martí",
        descripcion: "El libro habla de mis viajes y de mi trayectoria artística, de cómo llegué a ser poeta callejero, a vivir de eso y a crear otras tantas formas de ganar dinero con la poesía.",
        costo: "Gratuito",
        fecha: "2024-07-03",
        hora: "19:00 horas",
        ubicacion: "Dr. Mora. Esq. Av. Hidalgo 1 , Centro (Área 5), Cuauhtémoc, C.P. 06050, Ciudad de México"
    }
  ];
  