# Aula 06 — Geolocalização, Mapas e Câmera

## Objetivos da Aula

Solicitar permissões nativas do dispositivo (localização e câmera), capturar coordenadas GPS com `expo-location`, exibir mapa com marcadores via `react-native-maps` (no Android/iOS) e `react-leaflet` (no Web) usando uma **camada de compatibilidade** com extensões de plataforma, tirar fotos de comprovantes com `expo-image-picker` e associar localização e imagem às transações no SQLite. Foco em **uma única base de código rodando em Android, iOS e Web**.

---

## Pré-Requisitos — Configure Antes de Começar

### Ambiente base (deve estar instalado)

| Item | Verificar com |
|---|---|
| Node.js 20.x | `node -v` |
| Expo CLI | `expo --version` |
| Android Studio + AVD rodando | `adb devices` |
| Projeto `minhas-financas` das aulas 2–5 | `npx expo start` + tecla `a` |

### Pacotes novos — instalar no início da aula

```bash
npx expo install expo-location react-native-maps expo-image-picker
npm install leaflet react-leaflet
```

| Pacote | Função | Onde executa |
|---|---|---|
| `expo-location` | Acessa o GPS do dispositivo | Android / iOS |
| `react-native-maps` | Mapa nativo (Google Maps / Apple Maps) | Android / iOS |
| `expo-image-picker` | Abre câmera ou galeria e devolve a URI da imagem | Android / iOS / Web |
| `leaflet` + `react-leaflet` | Mapa OpenStreetMap (sem chave de API) | Web |

> Por que dois comandos? `npx expo install` escolhe versões compatíveis com a SDK do Expo. `leaflet` e `react-leaflet` são bibliotecas puras de browser — instaladas via npm.

---

## Conteúdo Teórico

### Como funciona a geolocalização em apps mobile

O dispositivo determina sua posição combinando três fontes:

| Fonte | Precisão | Consumo de bateria |
|---|---|---|
| GPS (satélite) | Alta (~3m) | Alto |
| Wi-Fi | Média (~15m) | Baixo |
| Torres de celular | Baixa (~100m) | Muito baixo |

O `expo-location` com `Accuracy.Balanced` escolhe automaticamente a melhor combinação.

### Permissões de localização

Apps mobile precisam de permissão explícita do usuário para acessar o GPS. Existem dois tipos:

- **Foreground** (`requestForegroundPermissionsAsync`) — somente enquanto o app está em uso
- **Background** (`requestBackgroundPermissionsAsync`) — mesmo com o app fechado

Nesta aula usamos apenas **foreground** — é o mais comum e aceito pelas lojas.

### O que são coordenadas geográficas?

```
latitude  → posição norte-sul  (-90 a +90)
longitude → posição leste-oeste (-180 a +180)

São Paulo:  latitude -23.5505, longitude -46.6333
Brasília:   latitude -15.7801, longitude -47.9292
```

### Níveis de precisão do expo-location

| Constante | Precisão | Consumo | Quando usar |
|-----------|----------|---------|-------------|
| `Accuracy.Lowest` | ~3km | Mínimo | Não recomendado |
| `Accuracy.Low` | ~1km | Muito baixo | Cidade aproximada |
| `Accuracy.Balanced` | ~100m | Baixo | **Recomendado — uso geral** |
| `Accuracy.High` | ~10m | Médio | Navegação turn-by-turn |
| `Accuracy.Highest` | ~3m | Alto | Topografia, corridas |
| `Accuracy.BestForNavigation` | ~1m | Muito alto | GPS especializado |

Para marcar onde uma transação foi feita, `Balanced` é ideal — precisão suficiente sem drenar a bateria.

### react-native-maps

O componente `MapView` renderiza um mapa interativo usando:
- **Google Maps** no Android
- **Apple Maps** no iOS

Principais componentes:

```jsx
<MapView initialRegion={regiao}>
  <Marker
    coordinate={{ latitude, longitude }}
    pinColor="#e74c3c"       // vermelho para despesa
    onPress={() => console.log('pin tocado')}
  >
    {/* Callout — balão exibido ao tocar no pin */}
    <Callout tooltip>
      <View style={{ padding: 8, backgroundColor: '#fff', borderRadius: 8 }}>
        <Text style={{ fontWeight: 'bold' }}>Supermercado</Text>
        <Text style={{ color: '#e74c3c' }}>- R$ 150,00</Text>
        <Text style={{ color: '#999', fontSize: 12 }}>07/04/2026</Text>
      </View>
    </Callout>
  </Marker>
</MapView>
```

- **`initialRegion`**: define o centro e o zoom do mapa ao abrir (`latitudeDelta` e `longitudeDelta` controlam o zoom — valores menores = mais próximo)
- **`pinColor`**: cor do pin (use as cores do tema para receitas/despesas)
- **`Callout tooltip`**: remove o estilo padrão do balão e permite total customização
- **`showsUserLocation={true}`**: exibe o ponto azul indicando a posição atual do usuário

### Mapas cross-platform com extensões `.native.js` / `.web.js`

`react-native-maps` usa código nativo (Java/Kotlin no Android, Swift no iOS) — abrir o app no navegador com `expo start --web` causa o erro:

```
Importing native-only module "react-native/Libraries/Utilities/codegenNativeCommands"
on web from: node_modules/react-native-maps/lib/MapMarkerNativeComponent.js
```

A solução padrão do React Native são as **extensões de plataforma**. O Metro escolhe automaticamente o arquivo certo conforme a plataforma de build:

| Arquivo | Quando é escolhido |
|---|---|
| `Foo.android.js` | Apenas Android |
| `Foo.ios.js` | Apenas iOS |
| `Foo.native.js` | Android **ou** iOS (qualquer um dos dois nativos) |
| `Foo.web.js` | Web (Expo Web / React Native Web) |
| `Foo.js` | Fallback se nenhuma extensão específica existir |

Nesta aula criamos `components/MapaCompat.{native,web}.js` — duas implementações com a **mesma API** (`MapView`, `Marker`, `Callout`). As telas (`MapaScreen.js`, `SeletorLocalMapa.js`) importam de `./MapaCompat` sem precisar saber em qual plataforma estão rodando:

```jsx
// Esta única linha funciona em iOS, Android e Web:
import { MapView, Marker, Callout } from '../components/MapaCompat';
```

No native, `MapaCompat.native.js` é apenas um re-export de `react-native-maps`. No web, `MapaCompat.web.js` usa `react-leaflet` + tiles do OpenStreetMap (sem chave de API). A API exposta é idêntica, então quem importa nunca precisa fazer `if (Platform.OS === 'web')`.

> **Padrão geral:** sempre que uma biblioteca nativa não suporta web, crie uma camada de compatibilidade com extensões. É a forma idiomática do React Native — mesmo abordagem usada por bibliotecas como `react-native-svg`, `react-native-webview` e o próprio `react-native-web`.

### Câmera e Galeria com expo-image-picker

O `expo-image-picker` resolve dois cenários com a mesma API:

| Função | O que faz | Permissão necessária |
|---|---|---|
| `launchCameraAsync(opcoes)` | Abre a **câmera** do dispositivo | `requestCameraPermissionsAsync` |
| `launchImageLibraryAsync(opcoes)` | Abre a **galeria** de fotos | `requestMediaLibraryPermissionsAsync` |

Ambas retornam um objeto no formato:

```jsx
{
  canceled: false,
  assets: [{ uri: 'file:///.../cache/ImagePicker/abc-123.jpg', width, height, ... }]
}
```

Principais opções:

| Opção | Efeito |
|---|---|
| `quality: 0.5` | Compressão JPEG (0.0 = mínima, 1.0 = máxima). Para comprovantes, 0.5 é suficiente |
| `allowsEditing: true` | Permite ao usuário cortar/girar a imagem antes de confirmar |
| `aspect: [3, 4]` | Proporção do recorte (só no Android; iOS deixa livre) |
| `mediaTypes` | `'Images'`, `'Videos'` ou `'All'` (padrão: `'Images'`) |

**O que se guarda no banco?** Apenas a **URI** (uma string como `file:///...`), não o binário da imagem. Isso mantém o SQLite leve. Em produção, normalmente faz-se upload da imagem para um servidor (S3, Firebase Storage) e armazena-se a URL pública resultante.

**Atenção — persistência:** a URI devolvida aponta para a pasta de **cache** do app, que o sistema operacional pode limpar a qualquer momento. Para que a imagem persista, copie-a para `FileSystem.documentDirectory` (assunto de aulas futuras) ou envie para um servidor.

---

## Estrutura de arquivos ao final da aula

```
minhas-financas/
├── hooks/
│   ├── useLocalizacao.js          ← NOVO: captura GPS
│   └── useComprovante.js          ← NOVO: câmera + galeria
├── components/
│   ├── MapaCompat.native.js       ← NOVO: re-export de react-native-maps
│   ├── MapaCompat.web.js          ← NOVO: implementação Leaflet + OpenStreetMap
│   └── SeletorLocalMapa.js        ← NOVO: modal para tocar e marcar local
├── screens/
│   ├── MapaScreen.js              ← NOVO: tela do mapa (usa MapaCompat)
│   ├── NovaTransacaoScreen.js     ← ATUALIZADO: localização, foto e SeletorLocalMapa
│   └── DetalheTransacaoScreen.js  ← ATUALIZADO: coordenadas, comprovante e ScrollView
├── routes/
│   └── TabRoutes.js               ← ATUALIZADO: aba Mapa
├── database/
│   └── db.js                      ← ATUALIZADO: colunas latitude, longitude, comprovante
└── app.json                       ← ATUALIZADO: plugins expo-location e expo-image-picker
```

---

## Projeto Demo em Sala

> **Atividade prática:** O código completo de `useLocalizacao`, `useComprovante`, `MapaScreen`, `NovaTransacaoScreen` (com localização e câmera), `DetalheTransacaoScreen` (com foto do comprovante) e a atualização do `db.js` está no [conteúdo complementar](./STEPS.md).

### Como rodar

```bash
cd minhas-financas

# Android / iOS (Expo Go ou emulador)
npx expo start
# pressione `a` para Android, `i` para iOS

# Web (OpenStreetMap via Leaflet)
npx expo start --web
```

Para simular localização no emulador Android: Android Studio → Extended Controls (⋯) → Location → defina as coordenadas e clique em **"Send"**.

Se o Expo Go não conectar (`IOException: Failed to download remote update`), tente `npx expo start --tunnel` ou conecte via USB com `adb reverse tcp:8081 tcp:8081`.

### O que o demo mostra

| Funcionalidade | Conceito demonstrado |
|----------------|----------------------|
| Botão "Minha localização" | `requestForegroundPermissionsAsync` + `getCurrentPositionAsync` |
| Botão "Escolher no mapa" | `SeletorLocalMapa` (`Modal` + `MapView` + `onPress`) |
| Botão "Tirar foto" | `requestCameraPermissionsAsync` + `launchCameraAsync` |
| Botão "Da galeria" | `requestMediaLibraryPermissionsAsync` + `launchImageLibraryAsync` |
| Preview do comprovante | `Image` + botão de remover sobreposto |
| Tela de Mapa com pins | `MapView`, `Marker`, `Callout` via `MapaCompat` |
| Cor do pin por tipo | `pinColor` condicional (verde = receita, vermelho = despesa) |
| Toque no pin exibe detalhes | `Callout tooltip` customizado |
| Detalhe da transação com foto | `Image` dentro de `ScrollView` (rola quando há foto grande) |
| Tela vazia sem localização | Empty state com ícone |
| Localização e foto no SQLite | Colunas `latitude`, `longitude` e `comprovante` opcionais |
| Migração automática do banco | `PRAGMA table_info` + `ALTER TABLE` |
| Mesma base nas 3 plataformas | Extensões `.native.js` / `.web.js` em `MapaCompat` |

### Estrutura do projeto demo

```
minhas-financas/
├── hooks/
│   ├── useLocalizacao.js          # encapsula permissão + GPS
│   └── useComprovante.js          # encapsula câmera e galeria
├── components/
│   ├── MapaCompat.native.js       # adapter para react-native-maps
│   ├── MapaCompat.web.js          # adapter para react-leaflet
│   └── SeletorLocalMapa.js        # modal cross-platform de seleção de local
├── screens/
│   ├── MapaScreen.js              # importa de MapaCompat (funciona nos 3 ambientes)
│   ├── NovaTransacaoScreen.js     # formulário com localização, foto e mapa
│   └── DetalheTransacaoScreen.js  # comprovante e coordenadas dentro de ScrollView
├── routes/
│   └── TabRoutes.js               # aba Mapa adicionada
└── database/
    └── db.js                      # colunas latitude, longitude e comprovante
```

---

---

---


## Observações sobre produção

### Chave de API do Google Maps (Android)

No Expo Go e builds de desenvolvimento, o mapa funciona sem chave. Para builds de produção (APK/AAB), é necessário:

1. Criar uma chave em [console.cloud.google.com](https://console.cloud.google.com)
2. Ativar "Maps SDK for Android"
3. Adicionar no `app.json`:
```json
"android": {
  "config": {
    "googleMaps": { "apiKey": "SUA_CHAVE_AQUI" }
  }
}
```

### Configurar localização no emulador

No Android Studio: Extended Controls (⋯) → Location → defina as coordenadas e clique em "Send".

### Câmera no emulador e simulador

- **Emulador Android:** possui câmera virtual. Acesse por **Extended Controls (⋯) → Camera** ou abra o app de câmera nativo do Android para garantir que esteja habilitada antes de testar.
- **iOS Simulator:** **não tem câmera**. Para testar comprovantes, use a opção **"Da galeria"** (ou execute em um dispositivo físico via TestFlight/EAS).

### Permissão de câmera no `app.json`

O plugin do `expo-image-picker` exige que a mensagem exibida no diálogo de permissão seja definida no `app.json`:

```json
"plugins": [
  "expo-sqlite",
  "expo-location",
  [
    "expo-image-picker",
    { "cameraPermission": "Permita o acesso à câmera para fotografar comprovantes." }
  ]
]
```

---

## Referências

- [Documentação expo-location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Documentação react-native-maps](https://github.com/react-native-maps/react-native-maps)
- [Documentação expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [react-leaflet](https://react-leaflet.js.org/) — componentes React para o Leaflet
- [Leaflet](https://leafletjs.com/) — biblioteca JS para mapas interativos
- [OpenStreetMap](https://www.openstreetmap.org/) — tiles e licença usados pelo `MapaCompat.web.js`
- [Platform-specific code (React Native)](https://reactnative.dev/docs/platform-specific-code) — extensões `.native.js` / `.web.js`
- [Google Maps Platform](https://console.cloud.google.com) — chaves de API (apenas builds nativos de produção)
