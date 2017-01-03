'use strict';

//Webスクレイピング　http://www.kutil.org/2016/01/easy-data-scrapping-with-google-apps.html
function GetEiganoJIkan() {
  var url = "https://movie.jorudan.co.jp/ranking/";
  var fromText = '<main>';
  var toText = '<div class="entry">';

  var content = UrlFetchApp.fetch(url).getContentText();
  var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();

  var match_str = scraped.toString();

  //日付取り出し
  var datestart = 8 + match_str.indexOf("<p>集計日付：");
  var dateend = match_str.indexOf("</p>",datestart);
  var Date = match_str.slice(datestart,dateend);
  var yearndate = Date.split("年");

  //articleの各要素を取り出し
  divide_element = match_str.split("</a>");

  for(var i=divide_element.length -1; i>=0; i--){
    if(i == divide_element.length -1){
      postTwitter(99,"","","");
      continue;
    }

    var Namestart = 8 + divide_element[i].indexOf("</span>　");
    var Nameend = divide_element[i].indexOf("</h3>",Namestart);
    var movieName = divide_element[i].slice(Namestart,Nameend);

    var imagestart = 10+ divide_element[i].indexOf("<img src=\"");
    var imageend = divide_element[i].indexOf("\" alt=",imagestart);
    var movieImage = divide_element[i].slice(imagestart,imageend);
    var movieImageURL = "https://movie.jorudan.co.jp" + movieImage;

    movieName = movieName.replace(/&#039;/,"'");
    movieName = movieName.replace(/&amp;/,"&");

    if(i<=10){
      var YouTubeURL = searchYouTube(movieName);
    }
    //twitterに投稿
    postTwitter(i+1,movieName,movieImageURL,YouTubeURL);

    //スプレッドシートに記入
    updateSpreadSheet(movieName,yearndate);
  }
}


//YouTube検索
//API認証は別のアカウント
function searchYouTube(movieName) {
  var keyword = movieName;
  var results = YouTube.Search.list("id,snippet",{q :keyword , maxResults: 1});

  //ビデオの要素ごとに分ける
  for(var i in results.items) {
    var item = results.items[i];
    var videoID = item.id.videoId;
    var videoURL = "https://www.youtube.com/watch?v="+videoID

    //IDとタイトルを表示
    //Logger.log("[%s] Title: %s", item.id.videoId, item.snippet.title);
  }
  return videoURL;
}


// ツイートを投稿
function postTwitter(rank,movieName,movieImageURL,YouTubeURL) {
  if(rank == 99){
   var message = "恋人や家族と一緒に映画はどうでしょうか\n週間映画ランキング(映画の時間調べ)";
  }else{
   var message = "第"+rank+"位\n"+movieName+"\n"+movieImageURL+"\n"+YouTubeURL;
  }

  var service  = twitter.getService();
  var response = service.fetch('https://api.twitter.com/1.1/statuses/update.json', {
    method: 'post',
    payload: { status: message }
  });
  response = JSON.parse(response);
  Logger.log(response);
  return response;
}

// OAuth1認証用インスタンス
var twitter = TwitterWebService.getInstance(
  //TwitterでAPIを登録し、以下の二つの値を入力する
  'consumer_key',
  'consumer_secret'
);

// 認証を行う（必須一回やったらおしまい）
function authorize() {
  twitter.authorize();
}
// 認証後のコールバック（必須）
function authCallback(request) {
  return twitter.authCallback(request);
}


//Googleスプレッドシートに投稿する
function updateSpreadSheet(movieName,yearndate){
  var MovieRankss = SpreadsheetApp.getActiveSpreadsheet();
  var SheetName = MovieRankss.getActiveSheet().getName();
  var AvtiveSheet = MovieRankss.getActiveSheet();
  var range = AvtiveSheet.getRange("A1");

  if(SheetName != yearndate[0]){
    MovieRankss.insertSheet(yearndate[0]);
    var AvtiveSheet = MovieRankss.getActiveSheet();

    range.setValue("タイトル");
    range.moveTo(AvtiveSheet.getRange("A2"));

    range.setValue("ランキング回数");
    range.moveTo(AvtiveSheet.getRange("B2"));
  }

  var compName = AvtiveSheet.getRange("A:A").getValues();
  Logger.log(compName);
  var flag = "false";
  for(var i=0;i<compName.length;i++){
    if(compName[i] == movieName){
    　var cellnum = "B"+(i+1).toString();
      var ranknum = AvtiveSheet.getRange(cellnum).getValues();
      ranknum++;
      range.setValue(ranknum);
      range.moveTo(AvtiveSheet.getRange(cellnum));
      flag = "ture";
      break;
    }
  }

  if(flag == "false"){
    //最終行取得
    var LastRow = AvtiveSheet.getLastRow();

    var cellnum = "A"+(LastRow+1).toString();
    range.setValue(movieName);
    range.moveTo(AvtiveSheet.getRange(cellnum));

    range.setValue(1);
    cellnum = "B"+(LastRow+1).toString();
    range.moveTo(AvtiveSheet.getRange(cellnum));
  }
}
