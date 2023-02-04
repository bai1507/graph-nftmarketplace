import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import {
  ItemBought as ItemBoughtEvent,
  ItemCanceled as ItemCanceledEvent,
  ItemListed as ItemListedEvent,
  ItemUpdated as ItemUpdatedEvent,
  ItemWithdraw as ItemWithdrawEvent,
} from "../generated/NftMarketplace/NftMarketplace";
import { ItemBought, ItemCanceled, ItemListed, ActiveItem } from "../generated/schema";
import { log } from "matchstick-as/assembly/log";

export function handleItemBought(event: ItemBoughtEvent): void {
  let entity = ItemBought.load(
    Bytes.fromHexString(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  );
  let activeItem = ActiveItem.load(
    Bytes.fromHexString(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  );
  if (!entity) {
    entity = new ItemBought(
      Bytes.fromHexString(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
    );
    entity.sender = event.params.sender;
    entity.nftAddress = event.params.nftAddress;
    entity.tokenId = event.params.tokenId;
    entity.price = event.params.price;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
  }

  activeItem!.buyer = event.params.sender;
  activeItem!.save();
}

export function handleItemCanceled(event: ItemCanceledEvent): void {
  let entity = ItemCanceled.load(
    Bytes.fromHexString(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  );
  let activeItem = ActiveItem.load(
    Bytes.fromHexString(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  );
  if (!entity) {
    entity = new ItemCanceled(
      Bytes.fromHexString(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
    );
    entity.sender = event.params.sender;
    entity.nftAddress = event.params.nftAddress;
    entity.tokenId = event.params.tokenId;
    entity.save();
  }

  activeItem!.buyer = Address.fromString("0x000000000000000000000000000000000000dEaD");
  activeItem!.save();
}

export function handleItemListed(event: ItemListedEvent): void {
  let entity = ItemListed.load(
    Bytes.fromHexString(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  );
  let activeItem = ActiveItem.load(
    Bytes.fromHexString(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  );
  if (!activeItem) {
    activeItem = new ActiveItem(
      Bytes.fromHexString(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
    );
  }
  if (!entity) {
    entity = new ItemListed(
      Bytes.fromHexString(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
    );
    entity.sender = event.params.sender;
    entity.nftAddress = event.params.nftAddress;
    entity.tokenId = event.params.tokenId;
    entity.price = event.params.price;
    entity.save();
  }

  activeItem.sender = event.params.sender;
  activeItem.nftAddress = event.params.nftAddress;
  activeItem.tokenId = event.params.tokenId;
  activeItem.price = event.params.price;
  activeItem.buyer = Address.fromString("0x0000000000000000000000000000000000000000");
  activeItem.save();
}

export function handleItemUpdated(event: ItemUpdatedEvent): void {
  let activeItem = ActiveItem.load(
    Bytes.fromHexString(getIdFromEventParams(event.params.param2, event.params.param1))
  );
  activeItem!.price = event.params.param3;
  activeItem!.save();
}

// export function handleItemWithdraw(event: ItemWithdrawEvent): void {
//   let entity = ItemWithdraw.load(event.transaction.hash.concatI32(event.logIndex.toI32()));
//   if (!entity) {
//     entity = new ItemWithdraw(event.transaction.hash.concatI32(event.logIndex.toI32()));
//   }
//   entity.param0 = event.params.param0;
//   entity.param1 = event.params.param1;

//   entity.blockNumber = event.block.number;
//   entity.blockTimestamp = event.block.timestamp;
//   entity.transactionHash = event.transaction.hash;

//   entity.save();
// }
function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
  let str = tokenId.toHexString() + nftAddress.toHexString();
  if (str.length % 2 != 0) {
    str += "1";
  }
  return str;
}
