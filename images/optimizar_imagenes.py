#!/usr/bin/env python3
"""
Optimizador de imágenes en lote — Complemento Matemático (versión estática)
===========================================================================
Deja livianas las imágenes de la carpeta images/ del SITIO ESTÁTICO (el que
subes a GitHub Pages), SIN cambiarles el nombre ni la extensión, así las rutas
de tus problemas (images/m1/P27...png, images/fisica/..., images/m2/...) siguen
funcionando igual. NO toca la carpeta del generador.

Cómo usarlo (lo más simple):
    1. Copia este archivo dentro de  complemento-matematico/  (al lado de index.html)
    2. Abre una terminal ahí y corre:
           python optimizar_imagenes.py
       Trabaja sobre ./images automáticamente.

Opciones:
    --carpeta RUTA     otra carpeta de imágenes (default: images)
    --ancho N          ancho máx. de los escaneos, en px (default: 1400)
    --logo-ancho N     ancho máx. de logos, en px (default: 512)
    --sin-backup       no crear copia de seguridad

Antes de tocar nada crea una copia en images_backup/ (salvo --sin-backup).
Si algo no te gusta: borras images/ y renombras images_backup/ de vuelta.
"""

import argparse
import os
import shutil
import sys

try:
    from PIL import Image
except ImportError:
    print("Falta la librería Pillow. Instálala con:")
    print("    pip install Pillow")
    sys.exit(1)

EXTS = (".png", ".jpg", ".jpeg", ".webp")

def humano(n):
    for u in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.1f} {u}"
        n /= 1024
    return f"{n:.1f} TB"

def es_logo(nombre):
    return "logo" in nombre.lower()

def optimizar(carpeta, ancho_max, ancho_logo, backup):
    if not os.path.isdir(carpeta):
        print(f"No existe la carpeta: {carpeta}")
        print("Corre el script dentro de complemento-matematico/ (donde está index.html),")
        print("o indícale la ruta con  --carpeta ruta/a/images")
        sys.exit(1)

    if backup:
        bdir = carpeta.rstrip("/\\") + "_backup"
        if os.path.exists(bdir):
            print(f"Ya existe {bdir} — se omite el backup para no pisarlo.")
        else:
            print(f"Creando copia de seguridad en: {bdir}")
            shutil.copytree(carpeta, bdir)

    archivos = []
    for raiz, _, files in os.walk(carpeta):
        if raiz.rstrip("/\\").endswith("_backup"):
            continue
        for f in files:
            if f.lower().endswith(EXTS):
                archivos.append(os.path.join(raiz, f))

    if not archivos:
        print("No se encontraron imágenes.")
        return

    total_antes = total_despues = 0
    tocadas = 0
    print(f"\nProcesando {len(archivos)} imágenes (escaneos <= {ancho_max}px, logos <= {ancho_logo}px)\n")

    for ruta in archivos:
        antes = os.path.getsize(ruta)
        total_antes += antes
        tope = ancho_logo if es_logo(os.path.basename(ruta)) else ancho_max
        try:
            img = Image.open(ruta)
            fmt = img.format
            if img.width > tope:
                alto = round(img.height * tope / img.width)
                img = img.resize((tope, alto), Image.LANCZOS)

            if fmt == "PNG":
                img.save(ruta, format="PNG", optimize=True)
            elif fmt in ("JPEG", "JPG"):
                img.save(ruta, format="JPEG", quality=82, optimize=True, progressive=True)
            elif fmt == "WEBP":
                img.save(ruta, format="WEBP", quality=82, method=6)
            else:
                img.save(ruta, optimize=True)

            despues = os.path.getsize(ruta)
            total_despues += despues
            tocadas += 1
            pct = (1 - despues / antes) * 100 if antes else 0
            rel = os.path.relpath(ruta, carpeta)
            etiqueta = " [logo]" if es_logo(os.path.basename(ruta)) else ""
            print(f"  {rel:<45} {humano(antes):>10} -> {humano(despues):>10}  (-{pct:.0f}%){etiqueta}")
        except Exception as e:
            total_despues += antes
            print(f"  [SALTADA] {os.path.relpath(ruta, carpeta)}: {e}")

    ahorro = (1 - total_despues / total_antes) * 100 if total_antes else 0
    print("\n" + "=" * 60)
    print(f"  Imagenes optimizadas: {tocadas}/{len(archivos)}")
    print(f"  Total antes:   {humano(total_antes)}")
    print(f"  Total despues: {humano(total_despues)}")
    print(f"  Ahorro:        {ahorro:.0f}%")
    print("=" * 60)
    if backup:
        print("  Si todo se ve bien, puedes borrar la carpeta images_backup.")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--carpeta", default="images")
    ap.add_argument("--ancho", type=int, default=1400)
    ap.add_argument("--logo-ancho", type=int, default=512, dest="logo_ancho")
    ap.add_argument("--sin-backup", action="store_true")
    args = ap.parse_args()
    optimizar(args.carpeta, args.ancho, args.logo_ancho, not args.sin_backup)
