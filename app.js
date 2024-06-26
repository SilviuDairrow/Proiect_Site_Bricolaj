const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fs = require('fs');
const app = express();
const port = 6789;
app.set('views', 'proiect-2-SilviuDairrow\\proiect-2-SilviuDairrow\\views')

let intrebari = [];
let users = [];

const sqlite3 = require('sqlite3').verbose();
const dbPath = 'pw12.db';
const db = new sqlite3.Database(dbPath);

fs.readFile('proiect-2-SilviuDairrow\\proiect-2-SilviuDairrow\\intrebari.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Eroare la citire intrebari.json:', err);
        return;
    }
    intrebari = JSON.parse(data);
});

fs.readFile('proiect-2-SilviuDairrow\\proiect-2-SilviuDairrow\\utilizatori.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Eroare la citire utilizatori.json:', err);
        return;
    }
    users = JSON.parse(data);
});
// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');

// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);

// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))

// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());

// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));

// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res

app.use(session({
    secret: 'rex23',
    resave: false,
    saveUninitialized: true
}));

// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția specificată
app.get('/chestionar', (req, res) => {
    // în fișierul views/chestionar.ejs este accesibilă variabila 'intrebari' care conține vectorul de întrebări
    res.render('chestionar', { intrebari: intrebari });
});


app.post('/rezultat-chestionar', (req, res) => {

    let raspCorecte = 0;

    for (let i = 0; i < intrebari.length; i++) {
        const raspunsCorect = intrebari[i].corect;
        const babuinRaspuns = parseInt(req.body[`intrebare${i}`]);

        if (raspunsCorect === babuinRaspuns) {
            raspCorecte++;
        }
    }

    res.render('rezultat-chestionar', { raspCorecte });
});

app.get('/autentificare', (req, res) => {
    res.render('autentificare');
});
///TODO: sa pun numele nu idUser
app.get('/', (req, res) => {
    const nume = req.session.user ? req.session.user.nume : 'Random Biban';

    db.all('SELECT * FROM produse', (err, rows) => {
        if (err) {
            console.error('Eroare cand extrag datele din pw12.db', err);
            return res.status(500).send('Eroare cand extrag datele din pw12.db');
        }
        res.render('index', { nume: nume, produse: rows, req: req });
    });
});

app.post('/verificare-autentificare', (req, res) => {
    const { idUser, password } = req.body;

    // test
    //console.log('User ID: ', idUser);
    //console.log('Password: ', password);
    const user = users.find(user => user.idUser === idUser && user.password === password);

    if (user) {
        req.session.user = {
            idUser: user.idUser,
            nume: user.nume,
            prenume: user.prenume,
            email: user.email
        };
        res.redirect('/');
    }
    else {
        res.status(401).send('Logare incorecta, nu exista username sau parola!');
    }

    //req.session.idUser = idUser;
    //req.session.password = password;

    //res.cookie('idUser', idUser, { maxAge: 232323, httpOnly: true });
    //res.cookie('password', password, { maxAge: 232323, httpOnly: true }); 

})

app.get('/deconectare', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Eroare la inchiderea sesiunii:', err);
            res.status(500).send('Eroare de server la nivel intern');
            return;
        }
        res.redirect('/');
    });
});

app.get('/creare-bd', (req, res) => {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS produse (
                    Id INTEGER PRIMARY KEY,
                    Nume TEXT,
                    Cantitate INTEGER,
                    Pret REAL
                );
        `, (err) => {
            if (err) {
                console.error('Eroare la crearea tabelului');
                res.status(500).send('Eroare la crearea tabelului');
            }
            else {
                console.log('Tabel creat cu succes');
                //res.send('Tabel creat cu succes');
                res.redirect('/');
            }
        });
    });
});
app.get('/inserare-bd', (req, res) => {
    db.serialize(() => {
        const Inserare = `
        INSERT INTO produse (Id, Nume, Cantitate, Pret) VALUES 
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?),
        (?, ?, ?, ?)
        `
        const nrProd = [
            1, 'Cuie', 2300, 0.39,
            2, 'Suruburi', 460, 0.25,
            3, 'Piulite', 723, 0.73,
            4, 'Dibluri', 253, 1.02,
            5, 'Armatura Ciment', 735, 23.32,
            6, 'Balast Ciment', 335, 55.02,
            7, 'Plasa Metal', 871, 20.35,
            8, 'Lemn Stejar', 940, 130.23,
            9, 'Lemn Nuc', 2355, 230.20,
            10, 'Lemn Prun', 1023, 156.56,
            11, 'Lemn Mesteacan', 23, 320.01
        ];
        db.run(Inserare, nrProd, function (err) {
            if (err) {
                console.error('Eroare cand incerc sa inserez date in table produse ' + err);
                res.status(500).send('Eroare cand incerc sa inserez date in table produse');
                //res.redirect('/')
            }
            else {
                console.log('Date inserate cu succes');
                //res.send('Date inserate cu succes');
                res.redirect('/');
            }
        })
    });
});


app.get('/sterge-bd', (req, res) => {
    db.serialize(() => {
        const Sterge = `DELETE FROM produse`;
        db.run(Sterge, function (err) {
            if (err) {
                console.log(`Eroare la stergerea tabelei produse`);
                res.status(500).send(`Eroare la stergerea tabelei produse`);
            }
            else {
                console.log('Date sterse cu succes');
                //res.send('Date sterse cu succes');
                res.redirect('/');
            }
        });
    });
});

app.get('/vizualizare-cos', (req, res) => {
    const cos = req.session.cos || [];

    // fac o mapa sa pun unic fiecare lucru pentru ca nu inteleg dc nu mi a mers la cos asa ca le construiesc aici si folosesc cos ca si un queue
    const ProduseMap = new Map();

    cos.forEach(produs => {
        if (!ProduseMap.has(produs.Id)) {
            ProduseMap.set(produs.Id, { ...produs });  //daca nu exista id fac unul nou
        }
        else {
            const ExistaProdus = ProduseMap.get(produs.Id); //daca exista, il caut in mapa si incrementez cantitatea
            ExistaProdus.Cantitate += produs.Cantitate;
        }
    });

    const CosRefacut = Array.from(ProduseMap.values());

    let total = 0;
    CosRefacut.forEach(item => {
        total += item.Pret * item.Cantitate;
    });

    res.render('vizualizare-cos', { cos: CosRefacut, total: total });

});

app.post('/adauga-in-cos', (req, res) => {
    const produsId = parseInt(req.body.produsId);

    db.get('SELECT * FROM produse WHERE Id = ?', [produsId], (err, rand) => {
        if (err) {
            console.error('Eroare la extragerea produsului din bd:', err);
            return res.status(500).send('Eroare la extragerea produsului din bd');
        }

        if (!rand) {
            return res.status(404).send('Produsul nu a fost gasit!');
        }

        let cos = req.session.cos || [];

        let found = false;
        for (let i = 0; i < cos.length; i++) {
            if (cos[i].Id === produsId) {
                cos[i].Cantitate++;
                found = true;
                break;
            }
        }

        if (!found) {
            cos.push({
                Id: rand.Id,
                Nume: rand.Nume,
                Cantitate: 1,
                Pret: rand.Pret
            });
        }

        req.session.cos = Object.assign([], cos);

        res.redirect('/');
    });
});



app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));