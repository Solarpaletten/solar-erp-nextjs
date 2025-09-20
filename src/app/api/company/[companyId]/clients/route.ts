// src/app/api/company/[companyId]/clients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ========================== GET ==========================
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    console.log('=== CLIENTS API GET START ===')
    
    const { companyId } = await context.params
    const company_id = parseInt(companyId)

    if (isNaN(company_id)) {
      console.log('Invalid company ID:', companyId)
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid company ID' 
      }, { status: 400 })
    }

    console.log('Loading clients for company:', company_id)

    // Подключение к базе
    await prisma.$connect()
    console.log('Database connected')

    // Получить клиентов для компании
    const clients = await prisma.clients.findMany({
      where: { company_id },
      orderBy: { id: 'desc' }
    })

    console.log(`Found ${clients.length} clients`)

    return NextResponse.json({ 
      success: true, 
      clients 
    })

  } catch (error) {
    console.error('=== CLIENTS API GET ERROR ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Full error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: `Failed to load clients: ${error.message}` 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// ========================== POST ==========================
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    console.log('=== CLIENTS API POST START ===')
    
    const { companyId } = await context.params
    const company_id = parseInt(companyId)

    if (isNaN(company_id)) {
      console.log('Invalid company ID:', companyId)
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid company ID' 
      }, { status: 400 })
    }

    const data = await request.json()
    console.log('Creating client with data:', data)
    console.log('Company ID:', company_id)

    // Валидация обязательных полей из схемы
    if (!data.name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Client name is required' 
      }, { status: 400 })
    }

    if (!data.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Client email is required' 
      }, { status: 400 })
    }

    // Подключение к базе
    await prisma.$connect()
    console.log('Database connected')

    // Создать клиента со всеми обязательными полями из схемы
    const clientData = {
      company_id,
      name: data.name,
      email: data.email,
      
      // Обязательные поля с default значениями из схемы
      role: data.role || 'CLIENT',  // ClientRole enum
      is_juridical: data.is_juridical !== undefined ? data.is_juridical : true,
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_foreigner: data.is_foreigner !== undefined ? data.is_foreigner : false,
      currency: data.currency || 'EUR',  // Currency enum
      created_by: 1, // TODO: Получать из токена аутентификации
      
      // Опциональные поля
      ...(data.abbreviation && { abbreviation: data.abbreviation }),
      ...(data.code && { code: data.code }),
      ...(data.phone && { phone: data.phone }),
      ...(data.fax && { fax: data.fax }),
      ...(data.website && { website: data.website }),
      ...(data.contact_information && { contact_information: data.contact_information }),
      ...(data.country && { country: data.country }),
      ...(data.legal_address && { legal_address: data.legal_address }),
      ...(data.actual_address && { actual_address: data.actual_address }),
      ...(data.business_license_code && { business_license_code: data.business_license_code }),
      ...(data.vat_code && { vat_code: data.vat_code }),
      ...(data.vat_rate && { vat_rate: data.vat_rate }),
      ...(data.eori_code && { eori_code: data.eori_code }),
      ...(data.foreign_taxpayer_code && { foreign_taxpayer_code: data.foreign_taxpayer_code }),
      ...(data.registration_number && { registration_number: data.registration_number }),
      ...(data.credit_sum && { credit_sum: data.credit_sum }),
      ...(data.pay_per && { pay_per: data.pay_per }),
      ...(data.payment_terms && { payment_terms: data.payment_terms }),
      ...(data.automatic_debt_reminder !== undefined && { automatic_debt_reminder: data.automatic_debt_reminder }),
      ...(data.registration_date && { registration_date: new Date(data.registration_date) }),
      ...(data.date_of_birth && { date_of_birth: new Date(data.date_of_birth) }),
      ...(data.sabis_customer_name && { sabis_customer_name: data.sabis_customer_name }),
      ...(data.sabis_customer_code && { sabis_customer_code: data.sabis_customer_code }),
      ...(data.additional_information && { additional_information: data.additional_information }),
      ...(data.notes && { notes: data.notes }),
    }

    console.log('Final client data for creation:', clientData)

    const newClient = await prisma.clients.create({
      data: clientData
    })

    console.log('Client created successfully with ID:', newClient.id)

    return NextResponse.json({ 
      success: true, 
      client: newClient 
    })

  } catch (error) {
    console.error('=== CLIENTS API POST ERROR ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Full error:', error)
    
    // Обработка уникальных ограничений
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field'
      return NextResponse.json({ 
        success: false, 
        error: `Client with this ${field} already exists` 
      }, { status: 409 })
    }

    // Обработка ошибок схемы
    if (error.code === 'P2000') {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid data provided' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: false, 
      error: `Failed to create client: ${error.message}` 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}