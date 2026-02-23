import Category from "../models/Category";

export interface CategoryTree {
  id: number;
  title: string;
  parentId: number | null;
  createdBy: number | null;
  createdByRole: "admin" | "seller" | null;
  childrens?: CategoryTree[];
}

const categoryService = {
  // Create a new category (admin or seller)
  create: async (
    title: string,
    parentId: number | null,
    userId: number,
    role: "admin" | "seller",
  ) => {
    const data = await Category.create({
      title,
      parentId: parentId ?? null,
      createdBy: userId,
      createdByRole: role,
    });
    return data;
  },

  // Get all categories as flat list
  // raw: true returns snake_case from DB so we map parent_id → parentId
  getAll: async () => {
    const data = (await Category.findAll({ raw: true })) as any[];
    return data.map((cat) => ({
      id: cat.id,
      title: cat.title,
      parentId: cat.parent_id ?? cat.parentId ?? null,
      createdBy: cat.created_by ?? cat.createdBy ?? null,
      createdByRole: cat.created_by_role ?? cat.createdByRole ?? null,
    }));
  },

  // Get categories as nested tree
  getTree: async (): Promise<CategoryTree[]> => {
    const raw = (await Category.findAll({ raw: true })) as any[];

    // Normalize snake_case → camelCase from DB
    const data: CategoryTree[] = raw.map((cat) => ({
      id: cat.id,
      title: cat.title,
      parentId: cat.parent_id ?? cat.parentId ?? null,
      createdBy: cat.created_by ?? cat.createdBy ?? null,
      createdByRole: cat.created_by_role ?? cat.createdByRole ?? null,
    }));

    const createTree = (parentId: number | null): CategoryTree[] => {
      return data
        .filter((cat) => cat.parentId == parentId) // loose == handles bigint
        .map((cat) => ({ ...cat, childrens: createTree(cat.id) }));
    };

    return createTree(null);
  },

  // Update category — admin can update any, seller only their own
  update: async (
    id: number,
    title: string,
    userId: number,
    role: "admin" | "seller",
  ) => {
    const category = (await Category.findByPk(id)) as any;

    if (!category) {
      throw { status: 404, message: "Category not found" };
    }

    // Sellers can only edit their own categories
    if (role === "seller" && category.created_by != userId) {
      throw { status: 403, message: "You can only edit your own categories" };
    }

    await category.update({ title });
    return category;
  },

  // Delete category — admin can delete any, seller only their own
  delete: async (id: number, userId: number, role: "admin" | "seller") => {
    const category = (await Category.findByPk(id)) as any;

    if (!category) {
      throw { status: 404, message: "Category not found" };
    }

    // Sellers can only delete their own categories
    if (role === "seller" && category.created_by != userId) {
      throw { status: 403, message: "You can only delete your own categories" };
    }

    await category.destroy();
    return { message: "Category deleted successfully" };
  },
};

export default categoryService;
