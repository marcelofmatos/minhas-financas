// screens/NovaTransacaoScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espacamento, raio } from '../theme';
import { useTransacoes } from '../context/TransacoesContext';
import { useLocalizacao } from '../hooks/useLocalizacao';
import { useComprovante } from '../hooks/useComprovante';
import { SeletorLocalMapa } from '../components/SeletorLocalMapa';

const CATEGORIAS = [
  { id: 'alimentacao', label: 'Alimentação', icone: 'restaurant' },
  { id: 'transporte', label: 'Transporte', icone: 'car' },
  { id: 'saude', label: 'Saúde', icone: 'medical' },
  { id: 'lazer', label: 'Lazer', icone: 'game-controller' },
  { id: 'moradia', label: 'Moradia', icone: 'home' },
  { id: 'salario', label: 'Salário', icone: 'cash' },
  { id: 'outros', label: 'Outros', icone: 'ellipsis-horizontal-circle' },
];

export function NovaTransacaoScreen({ navigation }) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('despesa');
  const [categoria, setCategoria] = useState('outros');
  const [localizacao, setLocalizacao] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [comprovante, setComprovante] = useState(null);

  const { adicionarTransacao } = useTransacoes();
  const { obterLocalizacao, obtendo: obtendoLoc } = useLocalizacao();
  const { tirarFoto, escolherDaGaleria, obtendo: obtendoFoto } = useComprovante();

  async function capturarGPS() {
    const coords = await obterLocalizacao();
    if (coords) setLocalizacao(coords);
  }

  function confirmarPinDoMapa(coords) {
    setLocalizacao(coords);
    setModalVisivel(false);
  }

  async function capturarComCamera() {
    const uri = await tirarFoto();
    if (uri) setComprovante(uri);
  }

  async function selecionarDaGaleria() {
    const uri = await escolherDaGaleria();
    if (uri) setComprovante(uri);
  }

  function removerComprovante() {
    setComprovante(null);
  }

  const salvar = async () => {
    if (!descricao.trim()) {
      Alert.alert('Atenção', 'Digite uma descrição.');
      return;
    }
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (!valor || isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Atenção', 'Digite um valor válido.');
      return;
    }

    await adicionarTransacao({
      id: Date.now().toString(),
      descricao: descricao.trim(),
      valor: valorNumerico,
      tipo,
      categoria,
      data: new Date().toLocaleDateString('pt-BR'),
      latitude:    localizacao?.latitude  ?? null,
      longitude:   localizacao?.longitude ?? null,
      comprovante: comprovante ?? null,
    });

    setDescricao('');
    setValor('');
    setTipo('despesa');
    setCategoria('outros');
    setLocalizacao(null);
    setComprovante(null);

    navigation.navigate('Dashboard');
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.tituloPagina}>Nova Transação</Text>

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.seletor}>
        {['receita', 'despesa'].map(t => (
          <TouchableOpacity
            key={t}
            style={[
              styles.botaoTipo,
              tipo === t && { backgroundColor: t === 'receita' ? cores.receita : cores.despesa }
            ]}
            onPress={() => setTipo(t)}
          >
            <Ionicons
              name={t === 'receita' ? 'arrow-up' : 'arrow-down'}
              size={18}
              color={tipo === t ? '#fff' : '#555'}
            />
            <Text style={[styles.textoTipo, tipo === t && { color: '#fff' }]}>
              {t === 'receita' ? 'Receita' : 'Despesa'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ex: Supermercado, Salário..."
        maxLength={50}
        returnKeyType="next"
      />

      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={setValor}
        placeholder="0,00"
        keyboardType="decimal-pad"
        returnKeyType="done"
      />

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.categorias}>
        {CATEGORIAS.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chipCategoria, categoria === cat.id && styles.chipAtivo]}
            onPress={() => setCategoria(cat.id)}
          >
            <Ionicons
              name={cat.icone}
              size={16}
              color={categoria === cat.id ? '#fff' : cores.subtexto}
            />
            <Text style={[styles.textoChip, categoria === cat.id && { color: '#fff' }]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Localização (opcional)</Text>
      <View style={styles.botoesAcao}>
        <TouchableOpacity
          style={[styles.botaoAcao, localizacao && styles.botaoAcaoAtivo]}
          onPress={capturarGPS}
          disabled={obtendoLoc}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={18} color={localizacao ? '#fff' : cores.primaria} />
          <Text style={[styles.textoAcao, localizacao && { color: '#fff' }]}>
            {obtendoLoc ? 'Obtendo...' : 'Minha localização'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoAcao, localizacao && styles.botaoAcaoAtivo]}
          onPress={() => setModalVisivel(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="map" size={18} color={localizacao ? '#fff' : cores.primaria} />
          <Text style={[styles.textoAcao, localizacao && { color: '#fff' }]}>
            Escolher no mapa
          </Text>
        </TouchableOpacity>
      </View>

      {localizacao && (
        <Text style={styles.infoAuxiliar}>
          📍 {localizacao.latitude.toFixed(5)}, {localizacao.longitude.toFixed(5)}
        </Text>
      )}

      <Text style={styles.label}>Comprovante (opcional)</Text>
      <View style={styles.botoesAcao}>
        <TouchableOpacity
          style={[styles.botaoAcao, comprovante && styles.botaoAcaoAtivo]}
          onPress={capturarComCamera}
          disabled={obtendoFoto}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={18} color={comprovante ? '#fff' : cores.primaria} />
          <Text style={[styles.textoAcao, comprovante && { color: '#fff' }]}>
            {obtendoFoto ? 'Abrindo...' : 'Tirar foto'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoAcao, comprovante && styles.botaoAcaoAtivo]}
          onPress={selecionarDaGaleria}
          disabled={obtendoFoto}
          activeOpacity={0.8}
        >
          <Ionicons name="image" size={18} color={comprovante ? '#fff' : cores.primaria} />
          <Text style={[styles.textoAcao, comprovante && { color: '#fff' }]}>
            Da galeria
          </Text>
        </TouchableOpacity>
      </View>

      {comprovante && (
        <View style={styles.previewWrapper}>
          <Image source={{ uri: comprovante }} style={styles.preview} />
          <TouchableOpacity style={styles.botaoRemoverFoto} onPress={removerComprovante}>
            <Ionicons name="close-circle" size={28} color={cores.despesa} />
          </TouchableOpacity>
        </View>
      )}

      <SeletorLocalMapa
        visivel={modalVisivel}
        localizacaoAtual={localizacao}
        onConfirmar={confirmarPinDoMapa}
        onCancelar={() => setModalVisivel(false)}
      />

      <TouchableOpacity style={styles.botaoSalvar} onPress={salvar} activeOpacity={0.8}>
        <Ionicons name="checkmark" size={22} color="#fff" />
        <Text style={styles.textoBotao}>Salvar Transação</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo, padding: espacamento.md },
  tituloPagina: {
    fontSize: 22, fontWeight: 'bold', color: cores.texto,
    marginTop: espacamento.lg, marginBottom: espacamento.lg,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: espacamento.xs },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: raio.sm,
    padding: 12, fontSize: 16, marginBottom: espacamento.md,
    backgroundColor: '#fff',
  },
  seletor: { flexDirection: 'row', gap: 12, marginBottom: espacamento.md },
  botaoTipo: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: 12, borderRadius: raio.sm,
    borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff',
  },
  textoTipo: { fontSize: 15, fontWeight: '600', color: '#555' },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: espacamento.lg },
  chipCategoria: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: raio.pill, borderWidth: 1, borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  chipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  textoChip: { fontSize: 13, color: cores.subtexto },

  botoesAcao: { flexDirection: 'row', gap: 10, marginBottom: espacamento.xs },
  botaoAcao: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: 12, borderRadius: raio.md,
    borderWidth: 1, borderColor: cores.primaria, backgroundColor: '#fff',
  },
  botaoAcaoAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  textoAcao: { fontSize: 13, fontWeight: '600', color: cores.primaria },
  infoAuxiliar: { fontSize: 12, color: cores.subtexto, marginBottom: espacamento.md },

  previewWrapper: {
    alignSelf: 'flex-start',
    marginVertical: espacamento.md,
    position: 'relative',
  },
  preview: {
    width: 120, height: 160,
    borderRadius: raio.md,
    borderWidth: 1, borderColor: '#ddd',
    backgroundColor: '#eee',
  },
  botaoRemoverFoto: {
    position: 'absolute', top: -10, right: -10,
    backgroundColor: '#fff', borderRadius: 14,
  },

  botaoSalvar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: cores.primaria, padding: 16,
    borderRadius: raio.md, marginBottom: espacamento.xl,
    marginTop: espacamento.md,
  },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
