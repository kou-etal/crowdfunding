# FundMyThesis (Crowdfunding Platform for Researchers)

研究者や大学院生向けのクラウドファンディングプラットフォームのMVPです。  
ユーザーはプロジェクトを作成し、PayPalを使って支援を受けることができます。  
実際にデプロイしたURL  
https://fund.initialetal.com
## Features

### 🧑‍🔬 ユーザー機能
- ユーザー登録・ログイン
- 本人確認（顔画像・本人確認書類・指導教員情報）
- プロジェクト作成・編集
- 支援・決済（PayPal）

### 🛠️ 管理者機能
- 本人確認の承認・却下
- プロジェクトの承認・却下
- 支援状況の閲覧

### 💳 決済機能
- **PayPal Checkout** による決済
- USD固定通貨

### 🎨 フロントエンド
- React + Vite
- Shadcn UI + TailwindCSS

## Tech Stack

| Layer         | Technology        | Notes                    |
|--------------|--------------------|--------------------------|
| **Frontend** | React 18 + Vite    | SPA構成                  |
| **Backend**  | Laravel 12         | RESTful API              |
| **DB**       | MySQL             | UTF8MB4                  |
| **Payment**  | PayPal Checkout    | USD固定通貨              |
| **Web Server** | Apache 2.4       | ConoHa VPS / Laragon |
| **Env Mgmt** | `.env`             | `APP_URL`, `FRONTEND_URL`, PayPal |

## System Architecture

```txt
React (Vite) SPA
        |
        | axios (JSON)
        ↓
Laravel 12 REST API
        |
        | MySQL 8 (utf8mb4)
        ↓
PayPal Checkout (Sandbox/Live)
```


## FundMyThesis Setup Guide

FundMyThesis のローカル開発環境でのセットアップ手順です。  
Laragon(Laravel 12+MySQL) + React の構成を前提としています。

## **1. ローカル環境セットアップ**

### 1.1 リポジトリのクローン

git clone https://github.com/kou-etal/crowdfunding.git  
cd crowdfunding

### 1.2 バックエンド依存関係のインストール
composer install

### 1.3 フロントエンド依存関係のインストール
cd frontend  
npm install  
cd ..

### 1.4 環境変数の設定
cp .env.example .env  
php artisan key:generate

### 1.5 データベースの作成とマイグレーション
php artisan migrate 

### 1.6 開発サーバーの起動(サーバーサイドはLaragonのGUIで起動)
cd frontend  
npm run dev

## Future Features

