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

// Configuração do Swagger
const swaggerOptions = {
  definition: {
      openapi: '3.0.0',
      info: {
          title: 'API de Alunos',
          version: '1.0.0',
          description: 'Uma API para gerenciar alunos',
      },
  },
  apis: ['index.js'], // Substitua 'index.js' pelo nome do arquivo onde você define suas rotas.
};

const specs = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


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
  