import LoadingIndicator from "./Components/LoadingIndicator";
import Arena from "./Components/Arena";
import myEpicGame from "./utils/MyEpicGame.json";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData  } from "./constants";
import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from "./Components/SelectCharacter";
import { transform } from "typescript";

// Constantsを宣言する
const TWITTER_HANDLE = 'coffee_to_hon';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  // ユーザーのウォレットアドレスを格納するために使用する状態変数を定義する
  const [currentAccount, setCurrentAccount ] = useState(null);
  // characterNFTとsetCharacterNFTという状態変数を初期化する
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ユーザーがRinkeby Network に接続されているか確認する
  // '4' はRinkeby のネットワークコード
  const checkNetwork = async () => {
    try {
      if (window.ethereum.networkVersion !== "4") {
        alert("Rinkeby Test Network に接続してください");
      } else {
        console.log("Rinkeby に接続されています");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ユーザーがMetaMaskを持っているか確認する
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        // 次の行で return を使用するため、ここで isLoading を設定します。
        setIsLoading(false);
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
        // accountsにwebサイトを訪れたユーザーのウォレットアカウントを格納する
        // 複数所有している場合も加味
        const accounts = await ethereum.request({ method: "eth_accounts" });
        // もしアカウントが一つでも存在していたら、以下を実行
        if (accounts.length !== 0){
          // accountという変数にユーザーの1つ目のアドレスを格納
          const account = accounts[0];
          console.log("Found an authorized account:" , account);
          // currentAccountにユーザーのアカウントアドレスを格納
          setCurrentAccount(account);
          // checkNetwork();
        } else {
          console.log("No authorized account found");
        }
          //すべての関数ロジックの後に、state プロパティを解放します。
          setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // レンダリングメソッド
  const renderContent = () => {
  // アプリがロード中の場合は、LoadingIndicator をレンダリングします。
  if (isLoading) {
  return <LoadingIndicator />;
}
    // シナリオ1
    // ユーザーがwebアプリにログインしていない場合、webアプリ上に、"Connect Wallet to Get Started" ボタンを表示する
    if (!currentAccount) {
      return (
        <div className='connect-wallet-container'>
          <img src = "https://i.imgur.com/yMocj5x.png" alt = "Pikachu" />
          <button 
          className='cta-button connect-wallet-button'
          onClick = {connectWalletAction}
          >
            Connect Wallet to Get Started
          </button>
        </div>
      );
     // シナリオ2
     // ユーザーはwebアプリにログインしており、かつNFTキャラクターを持っていない場合、webアプリ上に`SelectCharacter` コンポーネントを表示します。
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
      // シナリオ3
      // ユーザーはwebアプリにログインしており、かつNFTキャラクターを持っている場合
      // Arenaでボスと戦う
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />;
    }
  };

  // connectWallet メソッドを実装する
  const connectWalletAction = async() => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      // ユーザーがウォレットを持っているか確認する
      checkIfWalletIsConnected();

      // ウォレットアドレスに対してアクセスをリクエストする
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      // ウォレットアドレスをcurrentAccount に紐づける
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // ユーザーがRinkebyに接続されているか確認する
      checkNetwork();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
  // ページがロードされたら、即座にロード状態を設定するようにします。
	  setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  // スマートコントラクトを呼び出す関数
  useEffect(() => {
  // ページがロードされた時に、useEffect()内の関数が呼び出される
    const fetchNFTMetadata = async () => {
      console.log("Checking for Character NFT on address:", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log("User has character NFT");
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log("No character NFT found");
      }
    	// ユーザーが保持している NFT の確認が完了したら、ロード状態を false に設定します。
	    setIsLoading(false);
    };

    // 接続されたウォレットがある場合のみ、下記を実行する
    if (currentAccount) {
      console.log("CUrrentAccount:", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);


  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
        <p className="header gradient-text">⚡️ METAVERSE GAME ⚡️</p>
          <p className="sub-text">プレイヤーと協力してボスを倒そう✨</p>
          {/** renderContent メソッドを呼び出す */}
          {renderContent()}
        </div>
        {/* <div className="connect-wallet-container">
            <img
              src="https://i.imgur.com/TXBQ4cC.png"
              alt="LUFFY"
            />
            <button 
              className = "cta-button connect-wallet-button"
              onClick = {connectWalletAction}
            >
              Connet Wallet To Get Started
            </button>
          </div>
        </div> */}
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );

};

export default App;
