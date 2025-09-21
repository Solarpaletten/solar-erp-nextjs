// src/app/api/company/[companyId]/clients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ companyId: string; id: string }> }
) {
  try {
    console.log('=== CLIENT GET BY ID START ===')

    const { companyId, id } = await context.params
    const company_id = parseInt(companyId)
    const client_id = parseInt(id)

    if (isNaN(company_id) || isNaN(client_id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid IDs provided'
      }, { status: 400 })
    }

    console.log(`Getting client ${client_id} for company ${company_id}`)

    await prisma.$connect()

    const client = await prisma.clients.findFirst({
      where: {
        id: client_id,
        company_id: company_id
      }
    })

    if (!client) {
      console.log('Client not found')
      return NextResponse.json({
        success: false,
        error: 'Client not found'
      }, { status: 404 })
    }

    console.log('Client found:', client.name)

    return NextResponse.json({
      success: true,
      client
    })

  } catch (error) {
    console.error('=== CLIENT GET ERROR ===')  // Note: should be DELETE, not UPDATE
    
    if (error instanceof Error) {
      console.error('Error type:', error.constructor.name)
      console.error('Error message:', error.message)
    } else {
      console.error('Unknown error:', error)
    }
  
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? `Failed to delete client: ${error.message}` : 'Failed to delete client'
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ companyId: string; id: string }> }
) {
  try {
    console.log('=== CLIENT UPDATE START ===')

    const { companyId, id } = await context.params
    const company_id = parseInt(companyId)
    const client_id = parseInt(id)

    if (isNaN(company_id) || isNaN(client_id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid IDs provided'
      }, { status: 400 })
    }

    const data = await request.json()
    console.log(`Updating client ${client_id} with data:`, data)

    await prisma.$connect()

    // Проверить что клиент принадлежит компании
    const existingClient = await prisma.clients.findFirst({
      where: {
        id: client_id,
        company_id: company_id
      }
    })

    if (!existingClient) {
      console.log('Client not found or access denied')
      return NextResponse.json({
        success: false,
        error: 'Client not found'
      }, { status: 404 })
    }

    // Подготовить данные для обновления (только переданные поля)
    const updateData: any = {}

    // Основные поля
    if (data['name'] !== undefined) updateData.name = data['name']
    if (data['email'] !== undefined) updateData.email = data['email']
    if (data['abbreviation'] !== undefined) updateData.abbreviation = data['abbreviation']
    if (data['code'] !== undefined) updateData.code = data['code']
    if (data['phone'] !== undefined) updateData.phone = data['phone']
    if (data['fax'] !== undefined) updateData.fax = data['fax']
    if (data['website'] !== undefined) updateData.website = data['website']
    if (data['contact_information'] !== undefined) updateData.contact_information = data['contact_information']

    // Enum и boolean поля
    if (data.role !== undefined) updateData.role = data.role
    if (data.is_juridical !== undefined) updateData.is_juridical = data.is_juridical
    if (data.is_active !== undefined) updateData.is_active = data.is_active
    if (data.is_foreigner !== undefined) updateData.is_foreigner = data.is_foreigner
    if (data.currency !== undefined) updateData.currency = data.currency

    // Адреса
    if (data.country !== undefined) updateData.country = data.country
    if (data.legal_address !== undefined) updateData.legal_address = data.legal_address
    if (data.actual_address !== undefined) updateData.actual_address = data.actual_address

    // Документы и коды
    if (data.business_license_code !== undefined) updateData.business_license_code = data.business_license_code
    if (data.vat_code !== undefined) updateData.vat_code = data.vat_code
    if (data.vat_rate !== undefined) updateData.vat_rate = data.vat_rate
    if (data.eori_code !== undefined) updateData.eori_code = data.eori_code
    if (data.foreign_taxpayer_code !== undefined) updateData.foreign_taxpayer_code = data.foreign_taxpayer_code
    if (data.registration_number !== undefined) updateData.registration_number = data.registration_number

    // Финансовые поля
    if (data.credit_sum !== undefined) updateData.credit_sum = data.credit_sum
    if (data.pay_per !== undefined) updateData.pay_per = data.pay_per
    if (data.payment_terms !== undefined) updateData.payment_terms = data.payment_terms
    if (data.automatic_debt_reminder !== undefined) updateData.automatic_debt_reminder = data.automatic_debt_reminder

    // Даты
    if (data.registration_date !== undefined) updateData.registration_date = data.registration_date ? new Date(data.registration_date) : null
    if (data.date_of_birth !== undefined) updateData.date_of_birth = data.date_of_birth ? new Date(data.date_of_birth) : null

    // SABIS поля
    if (data.sabis_customer_name !== undefined) updateData.sabis_customer_name = data.sabis_customer_name
    if (data.sabis_customer_code !== undefined) updateData.sabis_customer_code = data.sabis_customer_code

    // Дополнительная информация
    if (data.additional_information !== undefined) updateData.additional_information = data.additional_information
    if (data.notes !== undefined) updateData.notes = data.notes

    console.log('Update data:', updateData)

    // Обновить клиента
    const updatedClient = await prisma.clients.update({
      where: { id: client_id },
      data: updateData
    })

    console.log('Client updated successfully')

    return NextResponse.json({
      success: true,
      client: updatedClient
    })

  } catch (error) {
    console.error('=== CLIENT UPDATE ERROR ===')  // Note: should be DELETE, not UPDATE
    
    if (error instanceof Error) {
      console.error('Error type:', error.constructor.name)
      console.error('Error message:', error.message)
    } else {
      console.error('Unknown error:', error)
    }
  
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? `Failed to delete client: ${error.message}` : 'Failed to delete client'
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ companyId: string; id: string }> }
) {
  try {
    console.log('=== CLIENT DELETE START ===')

    const { companyId, id } = await context.params
    const company_id = parseInt(companyId)
    const client_id = parseInt(id)

    if (isNaN(company_id) || isNaN(client_id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid IDs provided'
      }, { status: 400 })
    }

    console.log(`Deleting client ${client_id} from company ${company_id}`)

    await prisma.$connect()

    // Проверить что клиент принадлежит компании
    const existingClient = await prisma.clients.findFirst({
      where: {
        id: client_id,
        company_id: company_id
      }
    })

    if (!existingClient) {
      console.log('Client not found or access denied')
      return NextResponse.json({
        success: false,
        error: 'Client not found'
      }, { status: 404 })
    }

    // Удалить клиента
    await prisma.clients.delete({
      where: { id: client_id }
    })

    console.log('Client deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    })

  } catch (error) {
    console.error('=== CLIENT DELETE ERROR ===')  // Note: should be DELETE, not UPDATE
    
    if (error instanceof Error) {
      console.error('Error type:', error.constructor.name)
      console.error('Error message:', error.message)
    } else {
      console.error('Unknown error:', error)
    }
  
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? `Failed to delete client: ${error.message}` : 'Failed to delete client'
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}