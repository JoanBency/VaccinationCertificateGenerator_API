const mysql = require('mysql');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const pdfmake = require('pdfmake');
const fs = require('fs');

var app = express();


const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
});

app.get('/vaccinecertificate/:id', (req, res) => {
    const id = req.params.id;
    con.connect(function(err) {
        con.query(`SELECT PL.PatientName, VAL.VaccineEntryId, NL.NurseName, VAL.AdministeredOn, VL.VaccineName, VL.DiseaseTargeted FROM vaccineclinic.VaccineAdministeredList AS VAL , vaccineclinic.PatientList AS PL, vaccineclinic.VaccineList AS VL, vaccineclinic.NursesList AS NL WHERE VAL.PatientId = PL.PatientId AND VAL.VaccineId = VL.VaccineId AND VAL.AdministeredById = NL.NurseId AND VAL.PatientId = ` + id, function(err, result, fields) {
            if (err) res.send(err);

            const vaccinations = result;

  // define the document definition
  const docDefinition = {
    content: [
      { text: 'Vaccination Certificate', style: 'header' },
      { text: '\n' },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto'],
          body: [
            ['Vaccine', 'Disease Targeted', 'Date', 'Healthcare Provider'],
            ...vaccinations.map(vaccination => [
              vaccination.VaccineName,
              vaccination.DiseaseTargeted,
              vaccination.NurseName,
              vaccination.NurseName
            ])
          ]
        }
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true
      }
    }
  };

  // create a new PDF document
  const pdfDoc = pdfmake.createPdf(docDefinition);

  // get the output stream
  const stream = pdfDoc.pipe(fs.createWriteStream('output.pdf'));

  // close the MySQL connection after the PDF document is created
  stream.on('finish', () => {
    connection.end();

  });
        });
    });
});

app.listen(process.env.PORT, () =>{
    console.log(`Server is running on port ${process.env.PORT}`);
})
module.exports = app;