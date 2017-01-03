# MovieRanking
GoogleAppsScriptを用いて、映画の時間からWebスクレイピングしTwitterに投稿するスクリプト

#使い方
1. Googleスプレッドシートを作成し、「ツール」→「スクリプトエディタ」を選択する
2. スクリプトを貼り付ける
3. 「リソース」→「ライブラリ」から、「TwitterWebService」と「Parser」のライブラリを追加する
4. https://apps.twitter.com/　からアプリケーションを登録する
5. 4.で登録したアプリケーションの`consumer_key`と`consumer_secret`をスクリプトのTwitterWebService.getInstanceにそれぞれ入力する
6. 「実行」→「authorize」を選択する
7. Ctrl + Enterでログが出力されるので、ログのURLに移動し認証を通す
8. 「実行」→「GetEiganoJIkan」でTwitterに投稿される
