const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const express = require('express')
const { Pool } = require('pg')
require('dotenv').config()

const PORT = 333

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL
})

const app = express()

app.use(express.urlencoded({ extended: true }));

app.use(express.json())

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        title: 'API de Alunos',
              version: '1.0.0',
              description: 'API para gerenciamento de alunos de uma escola, para o desafio prático re/start AWS',
              contact: {
                  name: 'Daniela Castro',
                  email: 'danielaadecastro14@gmail.com',
              },
    },
    apis: ['index.js'],
  };

const specs = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /alunos:
 *   get:
 *     summary: Obtém a lista de todos os alunos cadastrados.
 *     tags:
 *       - Alunos
 *     responses:
 *       200:
 *         description: Lista de alunos obtida com sucesso.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 nome: João
 *               - id: 2
 *                 nome: Maria
 */


app.get('/', (req, res) => {console.log("Olá, mundo")})
app.get('/alunos', async (req, res) => {
    try {
        const {rows} = await pool.query("SELECT * FROM alunos");
        return res.status(200).send(rows);
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        return res.status(500).send('Erro interno do servidor');
    }
});

/**
 * @swagger
 * /alunos/criar:
 *   post:
 *     summary: Cria um novo aluno.
 *     tags:
 *       - Alunos
 *     requestBody:
 *       description: Dados do aluno a ser criado.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               nota_primeiro_semestre:
 *                 type: number
 *               nota_segundo_semestre:
 *                 type: number
 *               nome_professor:
 *                 type: string
 *               numero_sala:
 *                 type: integer
 *             example:
 *               nome: João
 *               nota_primeiro_semestre: 8.5
 *               nota_segundo_semestre: 9.0
 *               nome_professor: Maria
 *               numero_sala: 101
 *     responses:
 *       201:
 *         description: Aluno criado com sucesso.
 *         content:
 *           application/json:
 *             example:
 *               id: 3
 *               nome: João
 */


app.post('/alunos/criar', async (req, res) => {
    try {
      const { nome, nota_primeiro_semestre, nota_segundo_semestre, nome_professor, numero_sala } = req.body;
      const { rows } = await pool.query('INSERT INTO alunos (nome, nota_primeiro_semestre, nota_segundo_semestre, nome_professor, numero_sala) VALUES ($1, $2, $3, $4, $5) RETURNING *', [nome, nota_primeiro_semestre, nota_segundo_semestre, nome_professor, numero_sala]);

      return res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      return res.status(500).send('Erro interno do servidor');
    }
  });


/**
 * @swagger
 * /alunos/editar/{id}:
 *   put:
 *     summary: Edita um aluno existente.
 *     tags:
 *       - Alunos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do aluno a ser editado.
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Novos dados do aluno.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               nota_primeiro_semestre:
 *                 type: number
 *               nota_segundo_semestre:
 *                 type: number
 *               nome_professor:
 *                 type: string
 *               numero_sala:
 *                 type: integer
 *             example:
 *               nome: Maria
 *               nota_primeiro_semestre: 9.0
 *               nota_segundo_semestre: 9.5
 *               nome_professor: Ana
 *               numero_sala: 102
 *     responses:
 *       200:
 *         description: Aluno editado com sucesso.
 *         content:
 *           application/json:
 *             example:
 *               id: 2
 *               nome: Maria
 */

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

app.delete('/alunos/deletar/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await pool.query('DELETE FROM alunos WHERE id = $1', [id]);

        if (rowCount > 0) {
            return res.status(200).send(`Aluno com id ${id} foi deletado com sucesso.`);
        } else {
            return res.status(404).send(`Aluno com id ${id} não encontrado.`);
        }
    } catch (error) {
        console.error('Erro ao deletar aluno:', error);
        return res.status(500).send('Erro interno do servidor');
    }
});


/**
 * @swagger
 * /alunos/deletar/{id}:
 *   delete:
 *     summary: Deleta um aluno existente.
 *     tags:
 *       - Alunos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do aluno a ser deletado.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Aluno deletado com sucesso.
 *       404:
 *         description: Aluno não encontrado.
 */

app.put('/alunos/editar/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, nota_primeiro_semestre, nota_segundo_semestre, nome_professor, numero_sala } = req.body;
  
      const query = 
        "UPDATE alunos SET nome = $1, nota_primeiro_semestre = $2, nota_segundo_semestre = $3, nome_professor = $4, numero_sala = $5 WHERE id = $6 RETURNING *;"
      ;
      const values = [nome, nota_primeiro_semestre, nota_segundo_semestre, nome_professor, numero_sala, id];
  
      const { rows } = await pool.query(query, values);
  
      if (rows.length === 0) {
        return res.status(404).send('Aluno não encontrado.');
      }
  
      return res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Erro ao editar aluno:', error);
      return res.status(500).send('Erro interno do servidor');
    }
  });
  