require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARES
// ============================================================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// ============================================================
// SUPABASE CLIENT
// ============================================================
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// ============================================================
// ROTAS
// ============================================================

// ---------- GET /produtos : lista todos ----------
app.get('/produtos', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        console.error('Erro no GET /produtos:', err.message);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// ---------- GET /produtos/:id : busca um ----------
app.get('/produtos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return res.status(404).json({ error: 'Produto não encontrado' });
        res.status(200).json(data);
    } catch (err) {
        console.error('Erro no GET /produtos/:id:', err.message);
        res.status(500).json({ error: 'Erro ao buscar produto' });
    }
});

// ---------- POST /produtos : cadastra ----------
app.post('/produtos', async (req, res) => {
    const { nome, preco, quantidade } = req.body;

    const p = parseFloat(preco);
    const q = parseInt(quantidade);

    if (!nome || typeof nome !== 'string' || nome.trim() === '' || isNaN(p) || isNaN(q) || p <= 0 || q <= 0) {
        return res.status(400).json({ error: 'Dados inválidos enviados para o servidor' });
    }

    try {
        const { data, error } = await supabase
            .from('produtos')
            .insert([{ nome: nome.trim(), preco: p, quantidade: q }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error('Erro no POST /produtos:', err.message);
        res.status(500).json({ error: 'Erro ao cadastrar produto' });
    }
});

// ---------- PUT /produtos/:id : atualiza ----------
app.put('/produtos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const { nome, preco, quantidade } = req.body;
    const p = parseFloat(preco);
    const q = parseInt(quantidade);

    if (!nome || typeof nome !== 'string' || nome.trim() === '' || isNaN(p) || isNaN(q) || p <= 0 || q <= 0) {
        return res.status(400).json({ error: 'Dados inválidos enviados para o servidor' });
    }

    try {
        const { data, error } = await supabase
            .from('produtos')
            .update({ nome: nome.trim(), preco: p, quantidade: q })
            .eq('id', id)
            .select()
            .single();

        if (error || !data) return res.status(404).json({ error: 'Produto não encontrado' });
        res.status(200).json(data);
    } catch (err) {
        console.error('Erro no PUT /produtos/:id:', err.message);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

// ---------- DELETE /produtos/:id : remove um ----------
app.delete('/produtos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    try {
        const { error } = await supabase
            .from('produtos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(204).send();
    } catch (err) {
        console.error('Erro no DELETE /produtos/:id:', err.message);
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

// ---------- DELETE /produtos : remove TODOS ----------
app.delete('/produtos', async (req, res) => {
    try {
        const { error } = await supabase
            .from('produtos')
            .delete()
            .gte('id', 0);

        if (error) throw error;
        res.status(204).send();
    } catch (err) {
        console.error('Erro no DELETE /produtos:', err.message);
        res.status(500).json({ error: 'Erro ao limpar produtos' });
    }
});

// ============================================================
// INICIALIZAÇÃO
// ============================================================
// Só roda o listen quando executado diretamente (local)
// Na Vercel, o app é exportado e o listen é feito pela plataforma
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`✅ Servidor backend rodando em http://localhost:${PORT}`);
        console.log(`☁️  Banco: Supabase (${process.env.SUPABASE_URL})`);
    });
}

// Exporta para a Vercel
module.exports = app;