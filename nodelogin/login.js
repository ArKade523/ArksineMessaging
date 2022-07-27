const register = (req, res, path) => {
    res.sendFile(path.join('/register.html'), {'root': './'});
}

/*
This is the registration code. Users are redirected here after using the 
registration page. It hashes the new password and stores the hash,
username, and email to the database. The database automatically gives 
the account a new sequential ID.
*/

const registration = (req, res, connection, bcrypt) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;

    // console.log(`Username: ${username}`)
    // console.log(`Password: ${password}`)
    // console.log(`Email: ${email}`)

    // console.log(bcrypt.compare(password, newPassword));

    if (username && password && email) {
        hashPassword(username, password, email, connection, bcrypt);
        res.redirect('/');
    }
}

/*
This function takes care of hashing and storing a new user's password to the database.
It also takes care of putting their username and password into the database.
*/

async function hashPassword (username, password, email, connection, bcrypt) {
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log(hashedPassword);

    connection.query('INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)',
    [username, hashedPassword, email], (error, results, fields) => {
        if (error) throw error;

    })

    return `${hashedPassword}`;
}

/*
This is the function that handles password authentication. It decrypts and compares the 
entered password to the password stored in the database.
*/

const auth = (req, res, connection, user, bcrypt, socket_sessions) => {
    let username = req.body.username;
    let password = req.body.password;
 
    if (username && password) {
       connection.query('SELECT * FROM accounts where username = ?', 
       [username], (error, connresults, fields) =>  {
            if (error) throw error;
 
            console.log(connresults[0]);
            
            req.session.user_id = user.id = connresults[0].id;

            bcrypt.compare(password, connresults[0].password, (error, results) => {
                // if (error) throw error;
                if (!results) {
                    console.log(`Incorrect Password!`);
                    res.redirect('/')
                } else if (results) {
                    console.log('Correct Password!');
                    req.session.loggedin = true;
                    console.log(req.session)
                    res.redirect('/home');
                }
            })
        })
       
    } else {
       res.send('Please enter a Username and Password!');
       res.end();
    }
}

module.exports = {register, registration, hashPassword, auth};