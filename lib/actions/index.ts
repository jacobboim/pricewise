"use server";
import { revalidatePath } from "next/cache";
import Product from "./modeles/product.models";
import { connectToDB } from "./mongoose";
import { scrapeAmazonProduct } from "./scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "./utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "./nodemailer";

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) {
    return;
  }

  try {
    connectToDB();

    const scrapedProduct = await scrapeAmazonProduct(productUrl);

    if (!scrapedProduct) {
      return;
    }

    // Store the product in the database

    let product = scrapedProduct;

    const existing = await Product.findOne({ url: scrapedProduct.url });

    if (existing) {
      const updatedProduct: any = [
        ...existing.priceHistory,
        {
          price: scrapedProduct.currentPrice,
        },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedProduct,
        lowestPrice: getLowestPrice(updatedProduct),
        highestPrice: getHighestPrice(updatedProduct),
        averagePrice: getAveragePrice(updatedProduct),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
  } catch (e: any) {
    throw new Error(`Error scraping and storing product: ${e}`);
  }
}

export async function getProductById(productId: string) {
  try {
    connectToDB();

    const product = await Product.findById({ _id: productId });

    if (!product) {
      return;
    }

    return product;
  } catch (e: any) {
    throw new Error(`Error getting product by id: ${e}`);
  }
}

export async function getAllProducts() {
  try {
    connectToDB();

    const products = await Product.find();

    return products;
  } catch (e: any) {
    throw new Error(`Error getting all products: ${e}`);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    connectToDB();

    const currentProduct = await Product.findById(productId);

    if (!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProduct(
  productId: string,
  userEmail: string
) {
  try {
    const product = await Product.findById(productId);

    if (!product) return;

    const userExists = product.users.some(
      (user: User) => user.email === userEmail
    );

    if (!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log(error);
  }
}
