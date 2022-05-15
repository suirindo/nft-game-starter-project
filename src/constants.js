const CONTRACT_ADDRESS = "0xB38B9C57fd0a8B69DE0211a5280B190B0B9e285c";

// NFTキャラクターの属性をフォーマットしてオブジェクトとして返す
const transformCharacterData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        maxHp: characterData.maxHp.toNumber(),
        attackDamage: characterData.attackDamage.toNumber(),
    };
};

// 変数をconstants.js 以外の場所でも使えるようにする
export { CONTRACT_ADDRESS, transformCharacterData };

// https://rinkeby.rarible.com/token/0xB38B9C57fd0a8B69DE0211a5280B190B0B9e285c:1?tab=details