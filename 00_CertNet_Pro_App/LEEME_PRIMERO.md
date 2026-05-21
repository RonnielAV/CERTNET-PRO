# CertNet Pro App

Carpeta limpia de trabajo para abrir la aplicacion sin confundirse con documentos de referencia o prototipos.

## Archivos principales

- `index.html`: Manual tecnico y generador de certificados.
- `survey.html`: Modulo de levantamiento / Site Survey para preparar el informe de propuesta.
- `assets/css/styles.css`: Estilos generales de la aplicacion.
- `assets/css/survey.css`: Estilos especificos del levantamiento.
- `assets/js/app.js`: Logica del manual y certificador.
- `assets/js/survey.js`: Logica del levantamiento, JSON y reporte PDF.
- `assets/docs/manual-sistema-certnet.pdf`: Manual integrado.

## Flujo recomendado para el levantamiento

1. Abrir `survey.html`.
2. Seleccionar si el proyecto es desde cero o correccion/mejora.
3. Capturar cliente, direccion, alcance, pisos, cuartos, racks, puntos, riesgos y hallazgos.
4. Guardar el avance con `Guardar (.json)`.
5. Generar el informe PDF del levantamiento para proponer el proyecto.
6. Cuando se instale o corrija la red, usar `index.html` en la seccion `Generar certificado`.

## Carpetas de trabajo

- `proyectos-json`: sugerida para guardar respaldos JSON del avance.
- `informes-generados`: sugerida para guardar PDFs o HTML exportados.
