import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductService')

  async onModuleInit() {
    this.$connect();
    this.logger.log("Database connected")
  }

  create(createProductDto: CreateProductDto) {
    
    return this.product.create({data: createProductDto});
  
  }

  async findAll(pagination: PaginationDto) {
    const {page, limit}= pagination;
    
    const totalPage=await this.product.count({where: {available: true}});
    const lastPage= Math.ceil(totalPage/limit);


    return {

      data: await  this.product.findMany({
        skip: (page-1)*limit,
        take: limit,  
        where: {available: true}
      }),
      metadata:{
        total: totalPage,
        page: page,
        lastPage
      }
    }
  }

  async findOne(id: number) {
    const product= await this.product.findFirst({where:{id, available: true}}) 
    if(!product){
      throw new NotFoundException( `Product with id ${id} not found`)
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const {id: __, ...data}= updateProductDto;
    await this.findOne(id);
    return await this.product.update({where:{id, available: true}, data: data})
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.product.update(
      {where: {id}, data: {available: false }}
      
    )
  }
}
