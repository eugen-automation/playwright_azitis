import { ProductFormData, ProductCreateResult } from '@utils/interfaces/admin/product/product.interface';
import { RequestHandler } from '../../request-handler';



export async function createProductApi(newProductData: Partial<ProductFormData>, api: RequestHandler): Promise<ProductCreateResult> {

    try {
    // Step 1: Fetch the form data structure from the API
    // console.log('\n📋 Step 1: Fetching product form data structure...');
        const formDataResponse = await api
            .path('/product/form-data')
            .getRequest(200);

        const payload = { ...formDataResponse.fields, ...newProductData };

        // Step 2: Create the product
        console.log('\n🔨  Creating product...');
        const createProductResponse: ProductCreateResult = await api
            .path('/product/create')
            .body(payload)
            .postRequest(200);

        // Step 2: Create the product with a simple retry for transient server errors
        // console.log('\n📨 Step 2: Creating product...');
        // const maxAttempts = 2;
        // let attempt = 0;
        // while (attempt < maxAttempts) {
        //   attempt++;
        //   try {
        //     const createProductResponse = await api
        //       .path('/product/create')
        //       .body(payload)
        //       .postRequest(200);

        //     return createProductResponse;
        //   } catch (err) {
        //     console.warn(`Create product attempt ${attempt} failed: ${(err as Error).message}`);
        //     if (attempt >= maxAttempts) {
        //       throw err;
        //     }
        //     // small delay before retry
        //     await new Promise((res) => setTimeout(res, 1000));
        //   }
        // }
        // Shouldn't reach here
        // return { message: 'Product creation failed after retries' };

        return createProductResponse;
    }
    catch (error) {
        console.error('Error during product creation:', error);
        return { message: (error as Error).message };
    }
}