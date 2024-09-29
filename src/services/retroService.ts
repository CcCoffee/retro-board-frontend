import { RetroCard, ActionItem } from "@/types";

export const retroService = {
  getCards: async (): Promise<RetroCard[]> => {
    // 这里应该是实际的API调用
    const storedCards = localStorage.getItem("retroCards");
    return storedCards ? JSON.parse(storedCards) : [];
  },

  saveCard: async (card: RetroCard): Promise<void> => {
    // 这里应该是实际的API调用
    const cards = await retroService.getCards();
    const updatedCards = [...cards, card];
    localStorage.setItem("retroCards", JSON.stringify(updatedCards));
  },

  updateCards: async (cards: RetroCard[]): Promise<void> => {
    // 这里应该是实际的API调用
    localStorage.setItem("retroCards", JSON.stringify(cards));
  },

  getActionItems: async (): Promise<ActionItem[]> => {
    // 这里应该是实际的API调用
    const storedActionItems = localStorage.getItem("actionItems");
    return storedActionItems ? JSON.parse(storedActionItems) : [];
  },

  saveActionItem: async (actionItem: ActionItem): Promise<void> => {
    // 这里应该是实际的API调用
    const actionItems = await retroService.getActionItems();
    const updatedActionItems = [...actionItems, actionItem];
    localStorage.setItem("actionItems", JSON.stringify(updatedActionItems));
  },

  updateActionItems: async (actionItems: ActionItem[]): Promise<void> => {
    // 这里应该是实际的API调用
    localStorage.setItem("actionItems", JSON.stringify(actionItems));
  },
};