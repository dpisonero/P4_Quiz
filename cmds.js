const Sequelize = require('sequelize');
const {models} = require('./model');
const {log, biglog, errorlog, colorize} = require("./out");

exports.helpCmd = rl => {
    log("Comandos");
    log(" h|help - Muestra esta ayuda.");
    log(" list - Listar las quizzes existentes.");
    log(" show <id> - Muestra la pregunta y la respuesta al quiz indicado");
    log(" add - Añadir un nuevo quiz interactivamente.");
    log(" delete <id> - Borrar el quiz indicado.");
    log(" edit <id> - Editar el quiz indicado.");
    log(" test <id> - probar el quiz indicado.");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log(" credits - Créditos.");
    log(' q|quit - salir del programa.');
    rl.prompt();
};


exports.listCmd = rl => {

    models.quiz.findAll()
    .each(quiz => {
        log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};

const validateId = id => {

    return new Sequelize.Promise((resolve, reject) => {
        if (typeof id === "undefined") {
            reject(new Error(`Falta el parámetro <id>.`));
        } else {
            id = parseInt(id);
            if (Number.isNaN(id)) {
                reject(new Error(`El valor del parámetro <id> no es un número`));
            } else {
                resolve(id);
            }
        }
    });
};

exports.showCmd = (rl, id) => {

    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if (!quiz) {
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }
        log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);

    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};

const makeQuestion = (rl, text) => {
    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
            resolve(answer.trim());
        });
    });
};

exports.addCmd = rl => {
    makeQuestion(rl, ' Introduzca una pregunta: ')
    .then(q => {
        return makeQuestion(rl, ' Introduzca la respuesta ')
        .then(a => {
            return {question: q, answer: a};
        });
    })
    .then((quiz) => {
        return models.quiz.create(quiz);
    })
    .then((quiz) => {
        log(` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta' )} ${quiz.answer}`);
    })
    .catch(Sequelize.ValidationError, error => {
        errorlog('El quiz es erróneo:');
        error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};

exports.deleteCmd = (rl, id) => {
    validateId(id)
    .then(id => models.quiz.destroy({where: {id}}))
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};

exports.editCmd = (rl, id) => {
    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if (!quiz) {
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }

        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
        return makeQuestion(rl, ' Introduzca la pregunta: ')
        .then(q => {
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
            return makeQuestion(rl, ' Introduzca la respuesta ')
            .then(a => {
                quiz.question = q;
                quiz.answer = a;
                return quiz;
            });
        });
    })
    .then(quiz => {
        return quiz.save();
    })
    .then(quiz => {
        log(` Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
    })
    .catch(Sequelize.ValidationError, error => {
        errorlog('El quiz es erróneo:');
        error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};

exports.testCmd = (rl, id) => {
    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        return makeQuestion(rl, '¿'+quiz.question+'?')
        .then(a => {
            if(a.trim().toLowerCase() === quiz.answer.trim().toLowerCase()){
                log('correcta');
                rl.prompt();
            } else {
                log('incorrecta ');
                rl.prompt();
            }
            return quiz;
        });
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};

exports.playCmd = rl => {
    let score = 0;
    let toBeResolved = [];
    models.quiz.findAll()
        .each(quiz => {
            toBeResolved.push(quiz.id);
        })
        .then(() => {
            if (toBeResolved.length === 0) {
                errorlog('No hay ninguna pregunta');
            } else {
                const playOne = () => {
                    if (toBeResolved.length === 0) {
                        console.log('Su puntuación es ' + score + ' Fin ');
                        rl.prompt();
                    } else {
                        let x = Math.floor(Math.random() * toBeResolved.length);
                        let id = toBeResolved[x];
                        toBeResolved.splice(x, 1);
                        validateId(id)
                            .then(id => models.quiz.findById(id))
                            .then(quiz => {
                                return makeQuestion(rl, '¿' + quiz.question + '?')
                                    .then(a => {
                                        if (a.trim().toLowerCase() === quiz.answer.trim().toLowerCase()) {
                                            console.log('correcta');
                                            score++; playOne();
                                        } else {
                                            console.log('incorrecta . Su puntuación es ' + score + ' Fin ');
                                            rl.prompt();
                                        }
                                        return quiz;
                                    });
                            });
                    }
                };
                playOne();
            }
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};
//     for(let i=0; i<models.quiz.count(); i++){
//         toBeResolved.push(i);
//     }
//         if (toBeResolved.length === 0) {
//             errorlog('No hay ninguna pregunta');
//             rl.prompt();
//         } else {
//             const playOne = () => {
//                 if(toBeResolved.length === 0){
//                     log('Su puntuación es ' + score);
//                     log('Fin, has terminado todas las preguntas.');
//                     rl.prompt();
//                 } else {
//                     let id = Math.floor(Math.random() * toBeResolved.length);
//                     let quiz = models.quiz.findById(toBeResolved[id]);
//                     toBeResolved.splice(id, 1);
//                     rl.question(colorize('¿', 'red') + colorize(quiz.question, 'red') + colorize('? ', 'red'), answer => {
//                         if (answer.trim().toLowerCase() === quiz.answer.trim().toLowerCase()) {
//                             log('Su respuesta es: correcta');
//                             //biglog('Correcta', 'green');
//                             score++;
//                             //var index = toBeResolved.indexOf(id);
//                             playOne();
//                         } else {
//                             log('Su respuesta es incorrecta\n');
//                             //biglog('Incorrecta', 'red');
//                             log('Fin, el juego ha terminado');
//                             log('Su puntuación es ' + score);
//                             rl.prompt();
//                         }
//                     });
//                 }
//             };
//         playOne();
//     }
// };

exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('David Pisonero Fuentes', 'green');
    log('Ignacio Ortega Lobo', 'green');
    rl.prompt();
};

exports.quitCmd = rl => {
    rl.close();
};