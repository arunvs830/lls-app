import unittest
from models import CertificateLayout, db
from tests.base_test import BaseTestCase

class TestCertificate(BaseTestCase):
    def test_create_certificate_layout(self):
        """Test creating a certificate layout."""
        layout_data = {
            'layout_name': 'Test Certificate',
            'template_content': '{"objects": []}',
            'program_id': self.program.id,
            'is_default': True
        }
        
        response = self.client.post('/api/certificate-layouts', json=layout_data)
        
        
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['layout_name'], 'Test Certificate')
        self.assertEqual(data['message'], 'Certificate layout created successfully')

    def test_get_certificate_layouts(self):
        """Test retrieving all certificate layouts."""
        layout = CertificateLayout(
            layout_name="Existing Layout",
            template_content="{}",
            program_id=self.program.id
        )
        db.session.add(layout)
        db.session.commit()
        
        response = self.client.get('/api/certificate-layouts')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['layout_name'], "Existing Layout")

    def test_update_certificate_layout(self):
        """Test updating a certificate layout."""
        layout = CertificateLayout(
            layout_name="Old Name",
            template_content="{}",
            program_id=self.program.id
        )
        db.session.add(layout)
        db.session.commit()
        layout_id = layout.id
            
        update_data = {
            'layout_name': 'New Name',
            'template_content': '{"updated": true}'
        }
        
        response = self.client.put(f'/api/certificate-layouts/{layout_id}', json=update_data)
        self.assertEqual(response.status_code, 200)
        
        updated_layout = db.session.get(CertificateLayout, layout_id)
        self.assertEqual(updated_layout.layout_name, 'New Name')

    def test_delete_certificate_layout(self):
        """Test deleting a certificate layout."""
        layout = CertificateLayout(
            layout_name="To Delete",
            template_content="{}",
            program_id=self.program.id
        )
        db.session.add(layout)
        db.session.commit()
        layout_id = layout.id
            
        response = self.client.delete(f'/api/certificate-layouts/{layout_id}')
        self.assertEqual(response.status_code, 200)
        
        deleted = db.session.get(CertificateLayout, layout_id)
        self.assertIsNone(deleted)

    def test_update_default_without_program_id(self):
        """Test updating is_default to True without sending program_id."""
        # 1. Create Layout A (Default) for the program
        layout_a = CertificateLayout(
            layout_name="Layout A",
            template_content="{}",
            program_id=self.program.id,
            is_default=True
        )
        db.session.add(layout_a)
        db.session.commit()

        # 2. Create Layout B (Not Default) for the same program
        layout_b = CertificateLayout(
            layout_name="Layout B",
            template_content="{}",
            program_id=self.program.id,
            is_default=False
        )
        db.session.add(layout_b)
        db.session.commit()

        # 3. Update Layout B to be Default, WITHOUT sending program_id
        response = self.client.put(f'/api/certificate-layouts/{layout_b.id}', json={
            'is_default': True
        })
        self.assertEqual(response.status_code, 200)

        # 4. Verify Layout A is no longer default
        db.session.expire_all()
        layout_a_updated = db.session.get(CertificateLayout, layout_a.id)
        layout_b_updated = db.session.get(CertificateLayout, layout_b.id)

        self.assertTrue(layout_b_updated.is_default, "Layout B should be default")
        self.assertFalse(layout_a_updated.is_default, "Layout A should NOT be default anymore")

    def test_create_default_overrides_existing(self):
        """Test creating a new default layout unsets the existing default."""
        # 1. Create Layout A (Default)
        layout_a = CertificateLayout(
            layout_name="Layout A",
            template_content="{}",
            program_id=self.program.id,
            is_default=True
        )
        db.session.add(layout_a)
        db.session.commit()

        # 2. Create New Layout C as Default
        layout_data = {
            'layout_name': 'Layout C',
            'template_content': '{}',
            'program_id': self.program.id,
            'is_default': True
        }
        
        response = self.client.post('/api/certificate-layouts', json=layout_data)
        self.assertEqual(response.status_code, 201)

        # 3. Verify Layout A is no longer default
        db.session.expire_all()
        layout_a_updated = db.session.get(CertificateLayout, layout_a.id)
        
        self.assertFalse(layout_a_updated.is_default, "Layout A should NOT be default anymore")
