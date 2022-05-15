import LoadingIndicator from "../../Components/LoadingIndicator";
import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";

const SelectCharacter = ({ setCharacterNFT }) => {
    // characters = コントラクトから返されるNFTキャラクターのメタデータを保持するプロパティ
    // setCharacters = charactersの状態を更新するプロパティ
    // gameContract = コントラクトの状態を初期化して保存するプロパティ。
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);
    // Minting の状態保存する状態変数を初期化します。
    const [mintingCharacter, setMintingCharacter] = useState(false);

    // NFTキャラクターをMintする
    const mintCharacterNFTAction = (characterId) => async () => {
        try {
            if (gameContract) {
                 // Mint が開始されたら、ローディングマークを表示する。
                setMintingCharacter(true);
                console.log("Minting character in progress...");
                const mintTxn = await gameContract.mintCharacterNFT(characterId);
                await mintTxn.wait();
                console.log("mintTxn", mintTxn);
                // Mint が終了したら、ローディングマークを消す。
                setMintingCharacter(false);
            }
        } catch(error) {
            console.warn("MintCharacterAction Error:", error);
             // エラーが発生した場合も、ローディングマークを消す。
            setMintingCharacter(false);
        }
    };

    // ページがロードされた瞬間に下記を実行する
    useEffect(() => {
        const { ethereum } = window;
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer
            );

            // gameContractの状態を更新する
            setGameContract(gameContract);
        } else {
            console.log("Ethereum object not found");
        }
    }, []);

    useEffect(() => {
        // NFTキャラクターのデータをスマートコントラクトから取得する
        const getCharacters = async () => {
            try {
                console.log("Getting contract characters to mint");
                // ミント可能な全NFTキャラクターをコントラクトから呼び出す
                const charactersTxn = await gameContract.getAllDefaultCharacters();

                console.log("charactersTxn", charactersTxn);

                // すべてのNFTキャラクターのデータを変換する
                const characters = charactersTxn.map((characterData) => 
                transformCharacterData(characterData)
                );

                // ミント可能なすべてのNFTキャラクターの状態を設定する
                setCharacters(characters);
            } catch (error) {
                console.error("Something went wrong fetching characters:", error);
            }
        };

        // イベントを受信したときに起動するコールバックメソッド onCharacterMint を追加する
        const onCharacterMint = async (sender, tokenId, characterIndex) => {
            console.log(
                `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
            );
            // NFT キャラクターがMintされたら、コントラクトからメタデータを受け取り、アリーナ（ボスとのバトルフィールド)に移動するための状態に設定する
        if (gameContract) {
            const characterNFT = await gameContract.checkIfUserHasNFT();
            console.log("CharacterNFT: ", characterNFT);
            setCharacterNFT(transformCharacterData(characterNFT));

            alert(
                `NFTキャラクターがMintされました -- リンクはこちらです:https://rinkeby.rarible.com/token/${
                    gameContract.address
                  }:${tokenId.toNumber()}?tab=details`
            );
          }
        };
        // gameContractの準備ができたら、NFTキャラクターを読み込む
        if (gameContract) {
            getCharacters();
            // リスナーの設定：NFTキャラクターがMintされた通知を受け取る
            gameContract.on("CharacterNFTMinted", onCharacterMint);
        }

        return() => {
            // コンポーネントがマウントされたら、リスナーを停止する
            if (gameContract){
                gameContract.off("CharacterNFTMinted", onCharacterMint);
            }
        };
    }, [gameContract]);

    const renderCharacters = () =>
  characters.map((character, index) => (
    <div className="character-item" key={character.name}>
      <div className="name-container">
        <p>{character.name}</p>
      </div>
      <img src={`https://cloudflare-ipfs.com/ipfs/${character.imageURI}`} />
      <button
        type="button"
        className="character-mint-button"
        onClick={mintCharacterNFTAction(index)}
      >{`Mint ${character.name}`}</button>
    </div>
  ));

  return (
    <div className="select-character-container">
      <h2>⏬ 一緒に戦う NFT キャラクターを選択 ⏬</h2>
      {characters.length > 0 && (
        <div className="character-grid">{renderCharacters()}</div>
      )}
      {/* mintingCharacter = trueの場合のみ、ローディングマークを表示します。*/}
      {mintingCharacter && (
        <div className="loading">
          <div className="indicator">
            <LoadingIndicator />
            <p>Minting In Progress...</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default SelectCharacter;