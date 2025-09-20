// src/app/api/account/companies/[id]/copy/route.ts
// Исправлено под реальную схему Prisma

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Функция генерации уникального кода компании
async function generateUniqueCode(originalCode: string): Promise<string> {
  const baseCode = originalCode.split('_COPY_')[0]
  
  let counter = 1
  let newCode = `${baseCode}_COPY_${Math.floor(Math.random() * 1000)}`
  
  while (counter < 50) {
    const existing = await prisma.companies.findFirst({
      where: { code: newCode }
    })
    
    if (!existing) {
      return newCode
    }
    
    counter++
    newCode = `${baseCode}_COPY_${Math.floor(Math.random() * 1000)}_${counter}`
  }
  
  return `${baseCode}_COPY_${Date.now()}`
}

// Функция генерации уникального названия компании
async function generateUniqueName(originalName: string): Promise<string> {
  const baseName = originalName.replace(/ Copy( \d+)?$/, '')
  
  let counter = 1
  let newName = `${baseName} Copy`
  
  while (counter < 50) {
    const existing = await prisma.companies.findFirst({
      where: { name: newName }
    })
    
    if (!existing) {
      return newName
    }
    
    counter++
    newName = `${baseName} Copy ${counter}`
  }
  
  return `${baseName} Copy ${Date.now()}`
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== COPY API START ===')
    const companyId = parseInt(params.id)
    console.log('Company ID to copy:', companyId)
    
    if (isNaN(companyId)) {
      console.log('Invalid company ID')
      return NextResponse.json({ 
        success: false,
        error: 'Invalid company ID' 
      }, { status: 400 })
    }

    // Подключение к базе
    console.log('Connecting to database...')
    await prisma.$connect()
    console.log('Database connected')

    // Получить оригинальную компанию
    console.log('Finding original company...')
    const originalCompany = await prisma.companies.findUnique({
      where: { id: companyId }
    })

    if (!originalCompany) {
      console.log('Company not found')
      return NextResponse.json({ 
        success: false,
        error: 'Company not found' 
      }, { status: 404 })
    }

    console.log('Original company found:', {
      id: originalCompany.id,
      name: originalCompany.name,
      code: originalCompany.code
    })

    // Генерировать уникальные значения
    const uniqueCode = await generateUniqueCode(originalCompany.code)
    const uniqueName = await generateUniqueName(originalCompany.name)

    console.log('Generated unique values:', {
      code: uniqueCode,
      name: uniqueName
    })

    // Создать копию компании с полями из реальной схемы
    console.log('Creating company copy...')
    const copiedCompany = await prisma.companies.create({
      data: {
        // Обязательные поля
        code: uniqueCode,
        name: uniqueName,
        legal_entity_type: originalCompany.legal_entity_type,
        owner_id: originalCompany.owner_id,
        director_name: originalCompany.director_name,
        tax_country: originalCompany.tax_country,
        base_currency: originalCompany.base_currency,
        
        // Опциональные поля (копируем если есть)
        short_name: uniqueName.substring(0, 10),
        description: originalCompany.description,
        email: originalCompany.email,
        phone: originalCompany.phone,
        website: originalCompany.website,
        registration_number: originalCompany.registration_number,
        vat_number: originalCompany.vat_number,
        legal_address: originalCompany.legal_address,
        actual_address: originalCompany.actual_address,
        
        // Булевые поля
        is_active: true,
        setup_completed: originalCompany.setup_completed,
        email_verified: false
      }
    })

    console.log('Company copied successfully:', {
      id: copiedCompany.id,
      name: copiedCompany.name,
      code: copiedCompany.code
    })

    console.log('=== COPY API SUCCESS ===')

    return NextResponse.json({
      success: true,
      message: 'Company copied successfully',
      company: {
        id: copiedCompany.id,
        name: copiedCompany.name,
        code: copiedCompany.code,
        is_active: copiedCompany.is_active
      }
    })

  } catch (error) {
    console.error('=== COPY API ERROR ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Full error:', error)
    
    // Обработка специфичных ошибок Prisma
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: false,
        error: 'Company with this code or name already exists' 
      }, { status: 409 })
    }

    return NextResponse.json({ 
      success: false,
      error: `Failed to copy company: ${error.message}` 
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
    console.log('Database disconnected')
  }
}