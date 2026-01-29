import React, { useState, useEffect } from 'react'
import { Image, Loader, AlertCircle, CheckCircle, Trash2, Upload } from 'lucide-react'

export default function Wallpaper() {
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [wallpaperEmCache, setWallpaperEmCache] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
  verificarWallpaper()
}, [])

const verificarWallpaper = async () => {
  try {
    const resultado = await window.electron.obterWallpaper()
    if (resultado.existe && resultado.caminho) {
      setWallpaperEmCache(true)
      setPreviewUrl(resultado.caminho)
    } else {
      setWallpaperEmCache(false)
      setPreviewUrl(null)
    }
  } catch (erro) {
    console.error('Erro ao verificar wallpaper:', erro)
  }
}

  const handleUpload = async (event) => {
  const arquivo = event.target.files[0]
  if (!arquivo) return

  setProcessando(true)
  setErro('')
  setSucesso('')

  try {
    // Converter arquivo para base64
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        // e.target.result já é uma data URL completa
        const dataUrl = e.target.result

        // Salvar o wallpaper
        const salvarResultado = await window.electron.salvarWallpaper(dataUrl)

        if (salvarResultado.sucesso) {
          setSucesso('Wallpaper salvo com sucesso!')
          setWallpaperEmCache(true)
          // Usar a mesma data URL para preview
          setPreviewUrl(dataUrl)
        } else {
          setErro(salvarResultado.erro || 'Erro ao salvar wallpaper')
        }
      } catch (erro) {
        setErro('Erro: ' + erro.message)
      } finally {
        setProcessando(false)
      }
    }

    reader.readAsDataURL(arquivo)
  } catch (erro) {
    setErro('Erro: ' + erro.message)
    setProcessando(false)
  }
}





  const aplicarWallpaper = async () => {
    if (!wallpaperEmCache) {
      setErro('Nenhum wallpaper em cache. Faça upload primeiro.')
      return
    }

    setProcessando(true)
    setErro('')
    setSucesso('')

    try {
      const resultado = await window.electron.obterWallpaper()
      if (!resultado.existe) {
        setErro('Wallpaper não encontrado')
        return
      }

      const aplicarResultado = await window.electron.aplicarWallpaper(resultado.caminho)

      if (aplicarResultado.sucesso) {
        setSucesso('Wallpaper aplicado com sucesso!')
      } else {
        setErro(aplicarResultado.erro || 'Erro ao aplicar wallpaper')
      }
    } catch (erro) {
      setErro('Erro: ' + erro.message)
    } finally {
      setProcessando(false)
    }
  }

  const deletarWallpaper = async () => {
    if (!window.confirm('Tem certeza que deseja deletar o wallpaper em cache?')) {
      return
    }

    setProcessando(true)
    setErro('')
    setSucesso('')

    try {
      const resultado = await window.electron.deletarWallpaper()

      if (resultado.sucesso) {
        setSucesso('Wallpaper deletado com sucesso!')
        setWallpaperEmCache(false)
        setPreviewUrl('')
      } else {
        setErro(resultado.erro || 'Erro ao deletar wallpaper')
      }
    } catch (erro) {
      setErro('Erro: ' + erro.message)
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Image className="w-6 h-6 text-cyan-400" />
          Wallpaper
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Gerenciar wallpaper personalizado
        </p>
      </div>

      {erro && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-200">{erro}</p>
        </div>
      )}

      {sucesso && (
        <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-200">{sucesso}</p>
        </div>
      )}

      {/* Preview do Wallpaper */}
      Copiar

{wallpaperEmCache && previewUrl && (
  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
    <h3 className="text-sm font-semibold mb-3">Preview do Wallpaper em Cache:</h3>
    <img 
      src={previewUrl} 
      alt="Preview Wallpaper" 
      className="w-full h-48 object-cover rounded-lg bg-slate-700"
      onError={(e) => {
        console.error('Erro ao carregar imagem:', e)
        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"%3E%3Crect fill="%23374151" width="200" height="150"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="14"%3EImagem não disponível%3C/text%3E%3C/svg%3E'
      }}
    />
  </div>
)}

      {/* Upload de Wallpaper */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Upload de Wallpaper</h3>

        <p className="text-slate-400 text-sm">
          Faça upload de uma imagem para usar como wallpaper. A imagem será salva em cache e poderá ser aplicada em qualquer momento.
        </p>

        <label className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 hover:bg-slate-700/50 transition">
          <Upload className="w-8 h-8 text-cyan-400" />
          <div className="text-center">
            <p className="font-semibold text-white">Clique para selecionar imagem</p>
            <p className="text-slate-400 text-sm">ou arraste um arquivo aqui</p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={processando}
            className="hidden"
          />
        </label>

        {wallpaperEmCache && (
          <p className="text-green-400 text-sm">✓ Wallpaper em cache</p>
        )}
      </div>

      {/* Ações */}
      <div className="space-y-3">
        <button
          onClick={aplicarWallpaper}
          disabled={processando || !wallpaperEmCache}
          className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition font-semibold flex items-center justify-center gap-2"
        >
          {processando ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Aplicando...
            </>
          ) : (
            'Aplicar Wallpaper'
          )}
        </button>

        {wallpaperEmCache && (
          <button
            onClick={deletarWallpaper}
            disabled={processando}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition font-semibold flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Deletar Wallpaper em Cache
          </button>
        )}
      </div>

      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
        <p className="text-sm text-slate-300">
          ℹ️ <strong>Como funciona:</strong> Você faz upload da imagem uma única vez. Ela fica salva em cache no seu pendrive. Toda vez que você abrir o app, poderá aplicar o mesmo wallpaper sem precisar fazer upload novamente.
        </p>
      </div>
    </div>
  )
}
