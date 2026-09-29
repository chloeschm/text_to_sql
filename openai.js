require('dotenv').config();
const OpenAI = require('openai').default;
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})


async function getSQLFromOpenAI(schema, question) {
    const schemaString = schema.map(col => `${col.name} (${col.type})`).join(', ');
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: `You are an expert SQL parser. Someone who does not know SQL well, but needs to understand their database, 
                    is giving you a database schema and asking a question in natural language. 
                    You will generate the corresponding SQL query based on the schema and the question.
                    Make sure to use the correct table and column names as provided in the schema.
                    Make inferences when necessary, but do not make up any table or column names that are not in the schema.
                    The schema is: ${schemaString}, and the question is: ${question}.
                    Return ONLY the SQL query.
                    `
                },
            ],
            max_tokens: 1024,
            temperature: 0,
        });

        let sqlQuery = response.choices[0].message.content.trim();
        sqlQuery = sqlQuery.replace(/```sql\n?|\n?```/g, '').trim();
        return sqlQuery;
    } catch (error) {
        console.error('Error generating SQL from OpenAI:', error);
        throw error;
    }
}

module.exports = { getSQLFromOpenAI };
