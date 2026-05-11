# Passo a Passo — Geolocalização, Mapas e Câmera

**Módulo 06 — Aula 06**  
Prof. Marcelo Matos

> Continue com o projeto `minhas-financas`. Vamos adicionar **localização** às transações, exibi-las em um **mapa interativo** e permitir anexar um **comprovante fotográfico**. O mapa funciona em **Android, iOS e Web** através de uma camada de compatibilidade que troca a implementação conforme a plataforma.

---

## O que você vai construir

Ao final deste tutorial, o app terá:

- **Permissão de localização** solicitada ao usuário
- **Coordenadas capturadas** automaticamente (GPS) ou marcadas manualmente no mapa
- **Permissão de câmera** solicitada para anexar comprovantes
- **Foto do comprovante** capturada com a câmera **ou** escolhida da galeria
- **Tela de Mapa** com pins mostrando onde cada transação foi feita
- **Tela de Detalhe** com scroll, exibindo a foto do comprovante quando existir
- **Mapa cross-platform**: usa Google/Apple Maps no celular e OpenStreetMap (Leaflet) no navegador

---

## Antes de Começar — Checklist

- [ ] Projeto `minhas-financas` das Aulas 2 a 5 funcionando
- [ ] `database/db.js` usando a API **assíncrona** (`openDatabaseAsync`, `runAsync`, `execAsync`, `getAllAsync`)
- [ ] `TransacoesProvider` envolvendo o `NavigationContainer` em `App.js`
- [ ] Terminal aberto na pasta `minhas-financas`

---

## Passo 1 — Instalar as dependências

```bash
npx expo install expo-location react-native-maps expo-image-picker
npm install leaflet react-leaflet
```

> Por que dois comandos? `npx expo install` escolhe a versão de cada SDK Expo (`expo-location`, `expo-image-picker`) e do `react-native-maps` que é compatível com a sua versão do Expo. Já `leaflet` e `react-leaflet` são bibliotecas puramente web — instalamos pela versão mais recente do npm.

| Pacote | Função | Plataforma onde executa |
|---|---|---|
| `expo-location` | Acessa o GPS | Android / iOS |
| `react-native-maps` | Mapa nativo | Android / iOS |
| `expo-image-picker` | Câmera e galeria | Android / iOS / Web |
| `leaflet` + `react-leaflet` | Mapa OpenStreetMap | Web |

---

## Passo 2 — Configurar o `app.json`

Abra `app.json` e substitua o conteúdo pelo arquivo completo abaixo.  
As linhas marcadas com `// ← NOVO` são as únicas alterações em relação à aula anterior:

```json
{
  "expo": {
    "name": "minhas-financas",
    "slug": "minhas-financas",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-sqlite",
      "expo-location",
      [
        "expo-image-picker",
        {
          "cameraPermission": "Permita o acesso à câmera para fotografar comprovantes."
        }
      ]
    ]
  }
}
```

> O JSON do `app.json` **não aceita comentários** (`//`). Os marcadores `// ← NOVO` aqui são apenas didáticos — não os digite no arquivo real.

---

## Passo 3 — Criar o hook de localização

### 3.1 — Crie `hooks/useLocalizacao.js`

Este é um arquivo **novo** — crie-o do zero:

```jsx
// hooks/useLocalizacao.js
import { useState } from 'react';
import * as Location from 'expo-location';

export function useLocalizacao() {
  const [obtendo, setObtendo] = useState(false);

  async function obterLocalizacao() {
    setObtendo(true);
    try {
      // 1. Solicita permissão ao usuário
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null; // usuário negou
      }

      // 2. Obtém as coordenadas atuais
      const posicao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: posicao.coords.latitude,
        longitude: posicao.coords.longitude,
      };
    } catch (erro) {
      console.error('Erro ao obter localização:', erro);
      return null;
    } finally {
      setObtendo(false);
    }
  }

  return { obterLocalizacao, obtendo };
}
```

---

## Passo 4 — Criar o hook do comprovante (câmera + galeria)

### 4.1 — Crie `hooks/useComprovante.js`

Este é um arquivo **novo** — crie-o do zero:

```jsx
// hooks/useComprovante.js
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export function useComprovante() {
  const [obtendo, setObtendo] = useState(false);

  // Opção 1 — abre a câmera do dispositivo
  async function tirarFoto() {
    setObtendo(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return null;

      const resultado = await ImagePicker.launchCameraAsync({
        quality: 0.5,
        allowsEditing: true,
        aspect: [3, 4],
      });

      if (resultado.canceled) return null;
      return resultado.assets[0].uri;
    } catch (erro) {
      console.error('Erro ao tirar foto:', erro);
      return null;
    } finally {
      setObtendo(false);
    }
  }

  // Opção 2 — abre a galeria do dispositivo
  async function escolherDaGaleria() {
    setObtendo(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return null;

      const resultado = await ImagePicker.launchImageLibraryAsync({
        quality: 0.5,
        allowsEditing: true,
        aspect: [3, 4],
      });

      if (resultado.canceled) return null;
      return resultado.assets[0].uri;
    } catch (erro) {
      console.error('Erro ao escolher imagem:', erro);
      return null;
    } finally {
      setObtendo(false);
    }
  }

  return { tirarFoto, escolherDaGaleria, obtendo };
}
```

---

## Passo 5 — Adicionar localização e comprovante ao banco

### 5.1 — Atualizar `database/db.js`

Substitua o conteúdo **completo** do arquivo pelo código abaixo.  
As linhas marcadas com `// ← NOVO` são as únicas alterações em relação à aula anterior:

```jsx
// database/db.js
import * as SQLite from 'expo-sqlite';

let db;

// Cria a tabela se ainda não existir
export async function inicializarBanco() {
  db = await SQLite.openDatabaseAsync('minhasfinancas.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transacoes (
      id          TEXT PRIMARY KEY,
      descricao   TEXT NOT NULL,
      valor       REAL NOT NULL,
      tipo        TEXT NOT NULL,
      categoria   TEXT NOT NULL,
      data        TEXT NOT NULL,
      latitude    REAL,     -- ← NOVO
      longitude   REAL,     -- ← NOVO
      comprovante TEXT      -- ← NOVO (URI da foto do comprovante)
    );
  `);

  // ← NOVO: migração para quem já tinha o banco da aula anterior sem as colunas novas.
  const colunas = await db.getAllAsync('PRAGMA table_info(transacoes)');
  const nomes = colunas.map(c => c.name);
  if (!nomes.includes('latitude')) {
    await db.execAsync('ALTER TABLE transacoes ADD COLUMN latitude REAL');
    await db.execAsync('ALTER TABLE transacoes ADD COLUMN longitude REAL');
  }
  if (!nomes.includes('comprovante')) {
    await db.execAsync('ALTER TABLE transacoes ADD COLUMN comprovante TEXT');
  }
}

// Retorna todas as transações, mais recentes primeiro
export async function buscarTodasTransacoes() {
  return await db.getAllAsync(
    'SELECT * FROM transacoes ORDER BY rowid DESC'
  );
}

// Insere uma nova transação
export async function inserirTransacao(t) {
  await db.runAsync(
    `INSERT INTO transacoes
      (id, descricao, valor, tipo, categoria, data, latitude, longitude, comprovante)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,                    // ← NOVO: 3 parâmetros a mais
    [
      t.id,
      t.descricao,
      t.valor,
      t.tipo,
      t.categoria,
      t.data,
      t.latitude    ?? null,   // ← NOVO
      t.longitude   ?? null,   // ← NOVO
      t.comprovante ?? null,   // ← NOVO
    ]
  );
}

// Remove uma transação pelo id
export async function excluirTransacao(id) {
  await db.runAsync('DELETE FROM transacoes WHERE id = ?', [id]);
}
```

> As três novas colunas (`latitude`, `longitude`, `comprovante`) são **opcionais** — se o usuário negar a permissão ou simplesmente não usar o recurso, a transação é salva com `null` nesses campos.

---

## Passo 6 — Criar a camada de compatibilidade do mapa

**Por que precisamos disso?** O `react-native-maps` é nativo (Java/Kotlin no Android, Swift no iOS) e não funciona no navegador — se você abrir o app pelo `expo start --web`, o bundler falha com `Importing native-only module ... codegenNativeCommands`. Já o `react-leaflet` funciona perfeitamente na web mas não no celular.

A solução idiomática do React Native são as **extensões de plataforma**: `.native.js` (carregado no Android/iOS) e `.web.js` (carregado no navegador). O Metro escolhe automaticamente o arquivo certo. Criamos um wrapper `MapaCompat` que expõe a mesma API nos dois ambientes.

### 6.1 — Crie `components/MapaCompat.native.js`

Este é um arquivo **novo** — crie-o do zero. Ele simplesmente repassa o que vem do `react-native-maps`:

```jsx
// components/MapaCompat.native.js
// Em iOS/Android, MapaCompat é apenas um re-export do react-native-maps.
// O Metro escolhe este arquivo automaticamente; MapaCompat.web.js usa Leaflet.
import MapView, { Marker, Callout } from 'react-native-maps';

export { MapView, Marker, Callout };
export default MapView;
```

### 6.2 — Crie `components/MapaCompat.web.js`

Este é um arquivo **novo** — crie-o do zero. Ele reimplementa a API do `react-native-maps` em cima do `react-leaflet`:

```jsx
// components/MapaCompat.web.js
// Implementação web da API do react-native-maps usando Leaflet + OpenStreetMap.
// Expõe MapView, Marker e Callout com a mesma assinatura usada no native,
// para que MapaScreen e SeletorLocalMapa funcionem nos dois ambientes.
import React, {
  forwardRef, useImperativeHandle, useRef, useEffect, useMemo,
} from 'react';

// Injeta o CSS do Leaflet via <link> em vez de `import 'leaflet/dist/leaflet.css'`.
// Motivo: o Metro do Expo Web ainda não resolve `url(images/...)` dentro de arquivos
// CSS de node_modules, gerando warnings. Carregar o CSS direto da CDN evita o problema —
// a CDN serve o arquivo com paths absolutos já resolvidos.
if (typeof document !== 'undefined' && !document.getElementById('leaflet-css')) {
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  link.crossOrigin = '';
  document.head.appendChild(link);
}
import { View } from 'react-native';
import {
  MapContainer, TileLayer, Marker as LMarker, Popup, useMap, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';

// L.Icon.Default sobrescreve _getIconUrl para prefixar `imagePath` (detectado
// a partir do <link> do leaflet.css) na URL — isso ignora URLs absolutas e
// resulta em pin em branco. Deletar o método força o fallback para o
// _getIconUrl da classe base, que apenas lê options.iconUrl literalmente.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Converte a região do react-native-maps {latitude, longitude, *Delta}
// em centro + zoom do Leaflet.
function regiaoParaLeaflet({ latitude, longitude, latitudeDelta, longitudeDelta }) {
  const delta = Math.max(latitudeDelta || 0.1, longitudeDelta || 0.1);
  const zoom = Math.max(2, Math.min(18, Math.round(Math.log2(360 / delta))));
  return { center: [latitude, longitude], zoom };
}

// Subcomponente que captura cliques no mapa e dispara onPress no formato
// do react-native-maps: { nativeEvent: { coordinate: { latitude, longitude } } }
function CaptadorDeClique({ onPress }) {
  useMapEvents({
    click: (e) => {
      if (!onPress) return;
      onPress({
        nativeEvent: {
          coordinate: { latitude: e.latlng.lat, longitude: e.latlng.lng },
        },
      });
    },
  });
  return null;
}

// Expõe a instância do mapa para o ref imperativo (fitToCoordinates).
function PonteDoMapa({ aoCarregar }) {
  const map = useMap();
  useEffect(() => { aoCarregar(map); }, [map, aoCarregar]);
  return null;
}

export const MapView = forwardRef(function MapView(props, ref) {
  const { style, initialRegion, onPress, onMapReady, children } = props;
  const mapRef = useRef(null);

  useImperativeHandle(ref, () => ({
    fitToCoordinates(coords, opcoes = {}) {
      if (!mapRef.current || !coords || coords.length === 0) return;
      const bounds = coords.map(c => [c.latitude, c.longitude]);
      const pad = opcoes.edgePadding || {};
      mapRef.current.fitBounds(bounds, {
        paddingTopLeft:     [pad.left  ?? 0, pad.top    ?? 0],
        paddingBottomRight: [pad.right ?? 0, pad.bottom ?? 0],
        animate: opcoes.animated !== false,
      });
    },
  }), []);

  const { center, zoom } = useMemo(
    () => regiaoParaLeaflet(initialRegion || { latitude: 0, longitude: 0 }),
    [initialRegion]
  );

  return (
    <View style={style}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <CaptadorDeClique onPress={onPress} />
        <PonteDoMapa aoCarregar={(map) => {
          mapRef.current = map;
          if (onMapReady) onMapReady();
        }} />
        {children}
      </MapContainer>
    </View>
  );
});

// Marker — recebe coordinate e pinColor; usa DivIcon para colorir o pin.
// Sem pinColor, NÃO passamos a prop `icon` (o Leaflet usa L.Icon.Default — ver
// L.Icon.Default.mergeOptions no topo do arquivo). Passar `icon={undefined}`
// explicitamente quebra: o react-leaflet grava options.icon = undefined e o
// Leaflet estoura com "options.icon is undefined" ao tentar createIcon().
export function Marker({ coordinate, pinColor, children }) {
  const icon = useMemo(() => {
    if (!pinColor) return null;
    return L.divIcon({
      className: '',
      iconSize: [22, 30],
      iconAnchor: [11, 30],
      popupAnchor: [0, -28],
      html: `
        <svg width="22" height="30" viewBox="0 0 22 30" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 0C4.9 0 0 4.9 0 11c0 8 11 19 11 19s11-11 11-19c0-6.1-4.9-11-11-11z"
                fill="${pinColor}" stroke="white" stroke-width="2"/>
          <circle cx="11" cy="11" r="4" fill="white"/>
        </svg>`,
    });
  }, [pinColor]);

  const position = [coordinate.latitude, coordinate.longitude];
  return icon ? (
    <LMarker position={position} icon={icon}>{children}</LMarker>
  ) : (
    <LMarker position={position}>{children}</LMarker>
  );
}

// Callout — no native vira balão ao tocar no pin; no web é um Popup do Leaflet.
export function Callout({ children }) {
  return <Popup>{children}</Popup>;
}

export default MapView;
```

> **Vale a pena ler com calma:** essa é a parte mais densa da aula. O resumo é: **mesmo nome, mesma API, implementação diferente**. Quem importar de `./MapaCompat` recebe o `MapView`, `Marker` e `Callout` certos para o ambiente atual sem precisar saber em qual está rodando.

---

## Passo 7 — Criar o componente do seletor de local

### 7.1 — Crie `components/SeletorLocalMapa.js`

Este é um arquivo **novo** — crie-o do zero. Ele encapsula o modal com mapa que aparece quando o usuário toca em "Escolher no mapa". Como usa `MapaCompat`, funciona nas três plataformas:

```jsx
// components/SeletorLocalMapa.js
// Modal com mapa para o usuário tocar e escolher um ponto.
// Funciona no Android/iOS (react-native-maps) e no web (Leaflet) via MapaCompat.
import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MapView, Marker } from './MapaCompat';
import { cores, espacamento, raio } from '../theme';

const REGIAO_BRASIL = {
  latitude: -2.8235, longitude: -60.6753,
  latitudeDelta: 0.5, longitudeDelta: 0.5,
};

export function SeletorLocalMapa({ visivel, localizacaoAtual, onConfirmar, onCancelar }) {
  const [pinTemp, setPinTemp] = useState(null);

  const regiaoInicial = localizacaoAtual
    ? { ...localizacaoAtual, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : REGIAO_BRASIL;

  function confirmar() {
    if (pinTemp) onConfirmar(pinTemp);
    setPinTemp(null);
  }

  function cancelar() {
    setPinTemp(null);
    onCancelar();
  }

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={cancelar}>
      <SafeAreaView style={styles.modal}>
        <Text style={styles.instrucao}>Toque no mapa para marcar o local</Text>
        <MapView
          style={styles.mapa}
          initialRegion={regiaoInicial}
          onPress={e => setPinTemp(e.nativeEvent.coordinate)}
        >
          {pinTemp && <Marker coordinate={pinTemp} />}
        </MapView>
        <View style={styles.botoes}>
          <TouchableOpacity style={styles.botaoCancelar} onPress={cancelar}>
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botaoConfirmar, !pinTemp && { opacity: 0.4 }]}
            onPress={confirmar}
            disabled={!pinTemp}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.textoConfirmar}>Confirmar local</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, backgroundColor: '#fff' },
  instrucao: {
    textAlign: 'center', padding: espacamento.sm,
    fontSize: 14, fontWeight: '600', color: cores.texto,
  },
  mapa: { flex: 1 },
  botoes: {
    flexDirection: 'row', gap: 12,
    padding: espacamento.md, borderTopWidth: 1, borderTopColor: '#eee',
  },
  botaoCancelar: {
    flex: 1, padding: 14, borderRadius: raio.md,
    borderWidth: 1, borderColor: '#ddd', alignItems: 'center',
  },
  textoCancelar: { fontSize: 15, fontWeight: '600', color: '#555' },
  botaoConfirmar: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: 14, borderRadius: raio.md, backgroundColor: cores.primaria,
  },
  textoConfirmar: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
```

---

## Passo 8 — Atualizar a tela de Nova Transação

### 8.1 — Substituir `screens/NovaTransacaoScreen.js`

Substitua o conteúdo **completo** do arquivo pelo código abaixo.  
As linhas marcadas com `// ← NOVO` são as únicas alterações em relação à aula anterior:

```jsx
// screens/NovaTransacaoScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, Image                   // ← NOVO: Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espacamento, raio } from '../theme';
import { useTransacoes } from '../context/TransacoesContext';
import { useLocalizacao } from '../hooks/useLocalizacao';                 // ← NOVO
import { useComprovante } from '../hooks/useComprovante';                 // ← NOVO
import { SeletorLocalMapa } from '../components/SeletorLocalMapa';        // ← NOVO

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
  const [localizacao, setLocalizacao] = useState(null);  // ← NOVO
  const [modalVisivel, setModalVisivel] = useState(false); // ← NOVO
  const [comprovante, setComprovante] = useState(null);    // ← NOVO

  const { adicionarTransacao } = useTransacoes();
  const { obterLocalizacao, obtendo: obtendoLoc } = useLocalizacao();   // ← NOVO
  const { tirarFoto, escolherDaGaleria, obtendo: obtendoFoto } = useComprovante(); // ← NOVO

  // ← NOVO: opção 1 — usa o GPS do dispositivo
  async function capturarGPS() {
    const coords = await obterLocalizacao();
    if (coords) setLocalizacao(coords);
  }

  // ← NOVO: opção 2 — recebe o ponto escolhido pelo SeletorLocalMapa
  function confirmarPinDoMapa(coords) {
    setLocalizacao(coords);
    setModalVisivel(false);
  }

  // ← NOVO: comprovante — câmera
  async function capturarComCamera() {
    const uri = await tirarFoto();
    if (uri) setComprovante(uri);
  }

  // ← NOVO: comprovante — galeria
  async function selecionarDaGaleria() {
    const uri = await escolherDaGaleria();
    if (uri) setComprovante(uri);
  }

  // ← NOVO: remove a foto anexada
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
      latitude:    localizacao?.latitude  ?? null, // ← NOVO
      longitude:   localizacao?.longitude ?? null, // ← NOVO
      comprovante: comprovante ?? null,            // ← NOVO
    });

    setDescricao('');
    setValor('');
    setTipo('despesa');
    setCategoria('outros');
    setLocalizacao(null);   // ← NOVO
    setComprovante(null);   // ← NOVO

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

      {/* ← NOVO: dois botões de localização lado a lado */}
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

      {/* ← NOVO: dois botões de comprovante lado a lado */}
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

      {/* ← NOVO: preview da foto + botão para remover */}
      {comprovante && (
        <View style={styles.previewWrapper}>
          <Image source={{ uri: comprovante }} style={styles.preview} />
          <TouchableOpacity style={styles.botaoRemoverFoto} onPress={removerComprovante}>
            <Ionicons name="close-circle" size={28} color={cores.despesa} />
          </TouchableOpacity>
        </View>
      )}

      {/* ← NOVO: modal de seleção de local — funciona no native e no web */}
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

  // ← NOVO: botões de ação (localização e comprovante reutilizam o mesmo estilo)
  botoesAcao: { flexDirection: 'row', gap: 10, marginBottom: espacamento.xs },
  botaoAcao: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: 12, borderRadius: raio.md,
    borderWidth: 1, borderColor: cores.primaria, backgroundColor: '#fff',
  },
  botaoAcaoAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  textoAcao: { fontSize: 13, fontWeight: '600', color: cores.primaria },
  infoAuxiliar: { fontSize: 12, color: cores.subtexto, marginBottom: espacamento.md },

  // ← NOVO: preview do comprovante
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
```

---

## Passo 9 — Exibir o comprovante na tela de Detalhe (com scroll)

### 9.1 — Substituir `screens/DetalheTransacaoScreen.js`

Substitua o conteúdo **completo** do arquivo pelo código abaixo.  
As linhas marcadas com `// ← NOVO` são as únicas alterações em relação à aula anterior:

```jsx
// screens/DetalheTransacaoScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Platform, Image, ScrollView                     // ← NOVO: Image e ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransacoes } from '../context/TransacoesContext';
import { cores, espacamento, raio } from '../theme';

export function DetalheTransacaoScreen({ route, navigation }) {
  const { transacao } = route.params;
  const isReceita = transacao.tipo === 'receita';
  const { removerTransacao } = useTransacoes();

  function confirmarExclusao() {
    const mensagem = `Deseja excluir "${transacao.descricao}"?`;
    const excluir = () => {
      removerTransacao(transacao.id);
      navigation.goBack();
    };

    if (Platform.OS === 'web') {
      if (window.confirm(mensagem)) excluir();
      return;
    }

    Alert.alert(
      'Excluir transação',
      mensagem,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: excluir },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ← NOVO: ScrollView para permitir rolar quando há foto de comprovante */}
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={cores.texto} />
          <Text style={styles.textoVoltar}>Voltar</Text>
        </TouchableOpacity>

        <View style={[styles.icone, { backgroundColor: isReceita ? cores.receitaFundo : cores.despesaFundo }]}>
          <Ionicons
            name={isReceita ? 'arrow-up-circle' : 'arrow-down-circle'}
            size={48}
            color={isReceita ? cores.receita : cores.despesa}
          />
        </View>

        <Text style={styles.descricao}>{transacao.descricao}</Text>
        <Text style={[styles.valor, { color: isReceita ? cores.receita : cores.despesa }]}>
          {isReceita ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
        </Text>

        <View style={styles.tabela}>
          <View style={styles.linha}>
            <Text style={styles.rotulo}>Tipo</Text>
            <Text style={styles.dado}>{isReceita ? 'Receita' : 'Despesa'}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.rotulo}>Categoria</Text>
            <Text style={styles.dado}>{transacao.categoria}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.rotulo}>Data</Text>
            <Text style={styles.dado}>{transacao.data}</Text>
          </View>

          {/* ← NOVO: mostra coordenadas se existirem */}
          {transacao.latitude != null && transacao.longitude != null && (
            <View style={styles.linha}>
              <Text style={styles.rotulo}>Local</Text>
              <Text style={styles.dado}>
                {transacao.latitude.toFixed(4)}, {transacao.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>

        {/* ← NOVO: mostra a foto do comprovante se existir */}
        {transacao.comprovante && (
          <View style={styles.comprovanteWrapper}>
            <Text style={styles.comprovanteTitulo}>Comprovante</Text>
            <Image source={{ uri: transacao.comprovante }} style={styles.comprovante} resizeMode="contain" />
          </View>
        )}

        <TouchableOpacity
          style={styles.botaoExcluir}
          onPress={confirmarExclusao}
          accessibilityRole="button"
          accessibilityLabel="Excluir transação"
        >
          <Ionicons name="trash-outline" size={20} color={cores.despesa} />
          <Text style={styles.textoExcluir}>Excluir</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.fundo },
  container: {
    flexGrow: 1,                       // ← NOVO: dentro de ScrollView, flex vira flexGrow
    padding: espacamento.md,
    paddingBottom: espacamento.xl,     // ← NOVO: respiro pro botão Excluir não colar na borda
    alignItems: 'center',
  },
  botaoVoltar: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', marginBottom: espacamento.lg,
  },
  textoVoltar: { fontSize: 16, color: cores.texto },
  icone: {
    width: 88, height: 88, borderRadius: 44,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: espacamento.md,
  },
  descricao: { fontSize: 22, fontWeight: 'bold', color: cores.texto, marginBottom: 4 },
  valor: { fontSize: 32, fontWeight: '800', marginBottom: espacamento.lg },
  tabela: {
    width: '100%', backgroundColor: cores.cartao,
    borderRadius: raio.md, padding: espacamento.md, gap: 12,
  },
  linha: { flexDirection: 'row', justifyContent: 'space-between' },
  rotulo: { fontSize: 14, color: cores.subtexto },
  dado: { fontSize: 14, fontWeight: '600', color: cores.texto },

  // ← NOVO: comprovante
  comprovanteWrapper: {
    width: '100%',
    marginTop: espacamento.lg,
    alignItems: 'center',
  },
  comprovanteTitulo: {
    fontSize: 14, fontWeight: '600', color: cores.subtexto,
    marginBottom: espacamento.sm, alignSelf: 'flex-start',
  },
  comprovante: {
    width: '100%', height: 280,
    borderRadius: raio.md,
    backgroundColor: '#eee',
  },

  botaoExcluir: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, width: '100%',
    marginTop: espacamento.lg,
    paddingVertical: espacamento.md,
    borderRadius: raio.md, borderWidth: 1, borderColor: cores.despesa,
    backgroundColor: 'transparent',
  },
  textoExcluir: { fontSize: 16, fontWeight: '600', color: cores.despesa },
});
```

> **Por que `flexGrow: 1` em vez de `flex: 1`?** No estilo passado como `contentContainerStyle` do `ScrollView`, usar `flex: 1` trava o conteúdo na altura do viewport e desabilita o scroll. `flexGrow: 1` permite o conteúdo ocupar a altura mínima da tela (para alinhar centralizado) **e** crescer além dela (para rolar quando há uma foto grande).

---

## Passo 10 — Criar a tela de Mapa

### 10.1 — Crie `screens/MapaScreen.js`

Este é um arquivo **novo** — crie-o do zero. Note que ele importa de `MapaCompat`, não diretamente de `react-native-maps`:

```jsx
// screens/MapaScreen.js
// Funciona no Android/iOS (react-native-maps) e no web (Leaflet) via MapaCompat.
import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MapView, Marker, Callout } from '../components/MapaCompat';
import { useTransacoes } from '../context/TransacoesContext';
import { cores, espacamento, raio } from '../theme';

// Região exibida quando não há nenhum ponto marcado (Brasil inteiro)
const REGIAO_BRASIL = {
  latitude: -15.7801, longitude: -47.9292,
  latitudeDelta: 30, longitudeDelta: 30,
};

export function MapaScreen() {
  const { transacoes } = useTransacoes();
  const mapaRef = useRef(null);

  // Filtra apenas transações que têm coordenadas salvas
  const comLocalizacao = transacoes.filter(t => t.latitude && t.longitude);

  // Quando o mapa termina de carregar, ajusta o zoom para abranger todos os pins
  function aoMapaCarregar() {
    if (comLocalizacao.length === 0 || !mapaRef.current) return;
    mapaRef.current.fitToCoordinates(
      comLocalizacao.map(t => ({ latitude: t.latitude, longitude: t.longitude })),
      {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true,
      }
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {comLocalizacao.length === 0 ? (
        <View style={styles.vazio}>
          <Ionicons name="map-outline" size={64} color="#bdc3c7" />
          <Text style={styles.textoVazio}>Nenhuma transação com localização</Text>
          <Text style={styles.subtextoVazio}>
            Toque em "Minha localização" ao registrar uma transação
          </Text>
        </View>
      ) : (
        <MapView
          ref={mapaRef}
          style={styles.mapa}
          initialRegion={REGIAO_BRASIL}
          onMapReady={aoMapaCarregar}
        >
          {comLocalizacao.map(t => (
            <Marker
              key={t.id}
              coordinate={{ latitude: t.latitude, longitude: t.longitude }}
              pinColor={t.tipo === 'receita' ? cores.receita : cores.despesa}
            >
              <Callout tooltip>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitulo}>{t.descricao}</Text>
                  <Text style={[
                    styles.calloutValor,
                    { color: t.tipo === 'receita' ? cores.receita : cores.despesa },
                  ]}>
                    {t.tipo === 'receita' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                  </Text>
                  <Text style={styles.calloutData}>{t.data}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  mapa:     { flex: 1 },
  vazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: espacamento.md,
  },
  textoVazio:    { fontSize: 17, fontWeight: '600', color: cores.subtexto },
  subtextoVazio: { fontSize: 13, color: '#bdc3c7', textAlign: 'center' },
  callout: {
    backgroundColor: '#fff',
    borderRadius: raio.md,
    padding: espacamento.sm,
    minWidth: 160,
  },
  calloutTitulo: { fontSize: 14, fontWeight: '700', color: cores.texto },
  calloutValor:  { fontSize: 16, fontWeight: '800', marginTop: 2 },
  calloutData:   { fontSize: 12, color: cores.subtexto, marginTop: 2 },
});
```

---

## Passo 11 — Adicionar o Mapa ao TabNavigator

### 11.1 — Substituir `routes/TabRoutes.js`

Substitua o conteúdo **completo** do arquivo pelo código abaixo.  
As linhas marcadas com `// ← NOVO` são as únicas alterações em relação à aula anterior:

```jsx
// routes/TabRoutes.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardStack }       from './DashboardStack';
import { NovaTransacaoScreen }  from '../screens/NovaTransacaoScreen';
import { RelatorioScreen }      from '../screens/RelatorioScreen';
import { MapaScreen }           from '../screens/MapaScreen'; // ← NOVO
import { SobreScreen }          from '../screens/SobreScreen';

const Tab = createBottomTabNavigator();

const ICONES_TAB = {
  Dashboard:         { ativa: 'home',                 inativa: 'home-outline'                 },
  'Nova Transação':  { ativa: 'add-circle',           inativa: 'add-circle-outline'           },
  Relatório:         { ativa: 'bar-chart',            inativa: 'bar-chart-outline'            },
  Mapa:              { ativa: 'map',                  inativa: 'map-outline'                  }, // ← NOVO
  Sobre:             { ativa: 'information-circle',   inativa: 'information-circle-outline'   },
};

export function TabRoutes() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   '#2c3e50',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor:  '#eee',
          height:          60,
          paddingBottom:   8,
          paddingTop:      4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const { ativa, inativa } = ICONES_TAB[route.name];
          return <Ionicons name={focused ? ativa : inativa} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard"       component={DashboardStack}      />
      <Tab.Screen name="Nova Transação"  component={NovaTransacaoScreen} />
      <Tab.Screen name="Relatório"       component={RelatorioScreen}     />
      <Tab.Screen name="Mapa"            component={MapaScreen}          />
      <Tab.Screen name="Sobre"           component={SobreScreen}         />
    </Tab.Navigator>
  );
}
```

---

## Passo 12 — Testar

### Android / iOS (Expo Go)

```bash
npx expo start
```

Pressione `a` para Android ou `i` para iOS. Se o celular não conseguir baixar o bundle (`IOException: Failed to download remote update`), use modo tunnel:

```bash
npx expo start --tunnel
```

### Web

```bash
npx expo start --web
```

Abre direto no navegador. O mapa carrega tiles do OpenStreetMap — sem chave de API.

### Roteiro de teste

1. Vá em **Nova Transação**:
   - Preencha descrição, valor, tipo e categoria
   - Toque em **"Minha localização"** → autorize o acesso ao GPS
   - Toque em **"Tirar foto"** → autorize a câmera → fotografe um recibo (no web, use **"Da galeria"**)
   - Alternativamente, toque em **"Escolher no mapa"** e marque um ponto tocando no mapa
   - Salve a transação
2. Volte ao **Dashboard** e toque na transação recém-criada:
   - A tela de detalhe deve exibir as coordenadas e a foto
   - **Role para baixo** — o ScrollView permite ver a foto inteira e o botão Excluir
3. Vá na aba **"Mapa"**:
   - O pin da transação deve aparecer (verde se receita, vermelho se despesa)
   - Toque no pin → o callout mostra descrição, valor e data

---

## Resultado Final

| Funcionalidade | Status |
|----------------|--------|
| Solicitar permissão de GPS | ✅ `requestForegroundPermissionsAsync` |
| Capturar coordenadas | ✅ `getCurrentPositionAsync` |
| Escolher ponto no mapa | ✅ `SeletorLocalMapa` + `MapaCompat` |
| Solicitar permissão de câmera | ✅ `requestCameraPermissionsAsync` |
| Tirar foto do comprovante | ✅ `launchCameraAsync` |
| Selecionar foto da galeria | ✅ `launchImageLibraryAsync` |
| Salvar localização e foto no SQLite | ✅ colunas `latitude`, `longitude`, `comprovante` |
| Migração automática do banco | ✅ `PRAGMA table_info` + `ALTER TABLE` |
| Exibir mapa interativo | ✅ `MapaCompat` (Google/Apple no native, Leaflet no web) |
| Pins coloridos por tipo | ✅ `pinColor` no `Marker` |
| Info ao tocar no pin | ✅ `Callout` |
| Comprovante na tela de detalhe | ✅ `Image` dentro de `ScrollView` |
| Mesma base de código nas 3 plataformas | ✅ extensões `.native.js` / `.web.js` em `MapaCompat` |

---

## Resolução de Problemas

### "Cannot find module 'expo-location'" / 'expo-image-picker' / 'react-leaflet'
```bash
npx expo install expo-location react-native-maps expo-image-picker
npm install leaflet react-leaflet
```

### O diálogo de permissão não aparece
- **Android:** Configurações → Apps → minhas-financas → Permissões → habilite Localização e Câmera.
- **Expo Go:** as permissões são gerenciadas pelo próprio app Expo Go. Se já negou antes, revogue manualmente nas configurações do Expo Go.

### O mapa do Android fica cinza
No Expo Go e builds de desenvolvimento, funciona sem chave. Para builds de produção, adicione no `app.json`:
```json
"android": {
  "config": {
    "googleMaps": { "apiKey": "SUA_CHAVE_AQUI" }
  }
}
```

### `IOException: Failed to download remote update` no Expo Go
O celular não consegue alcançar o servidor Metro pela rede local. Soluções:
- **Modo tunnel:** `npx expo start --tunnel` (passa por ngrok, ignora a rede local)
- **USB:** `adb reverse tcp:8081 tcp:8081` + `npx expo start`, depois conecte manualmente via `exp://localhost:8081`

### `Importing native-only module ... codegenNativeCommands` ao abrir o web
Algum arquivo do projeto está importando `react-native-maps` diretamente. **Use sempre `from '../components/MapaCompat'`** — nunca importe `react-native-maps` em telas. O `MapaCompat.web.js` substitui automaticamente no bundle web.

### Localização retorna `null` no emulador
No Android Studio → **Extended Controls (⋯) → Location** → defina latitude e longitude e clique em **"Send"**.

### A câmera não abre no emulador
- **Emulador Android:** tem câmera virtual. **Extended Controls (⋯) → Camera**.
- **iOS Simulator:** **não tem câmera**. Use **"Da galeria"** para testar.

### "column latitude does not exist" / "column comprovante does not exist"
A tabela foi criada antes de adicionar as colunas. Desinstale e reinstale o app para recriar o banco do zero, ou execute manualmente uma vez:
```jsx
await db.execAsync('ALTER TABLE transacoes ADD COLUMN latitude REAL');
await db.execAsync('ALTER TABLE transacoes ADD COLUMN longitude REAL');
await db.execAsync('ALTER TABLE transacoes ADD COLUMN comprovante TEXT');
```

### A foto some depois de fechar o app
A URI devolvida pelo `expo-image-picker` aponta para a **pasta de cache** do app, que o sistema operacional pode limpar. Para persistir de verdade, copie-a para `FileSystem.documentDirectory` ou faça upload para um servidor.

### Os pins do Leaflet aparecem sem ícone no web
O `MapaCompat.web.js` aponta `iconUrl`/`iconRetinaUrl`/`shadowUrl` para a CDN do `unpkg.com`. Se sua rede bloqueia CDNs, baixe os PNGs do Leaflet e copie para `assets/leaflet/`, depois substitua as URLs.
