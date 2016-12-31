describe('Test True and False', function(){

    var html_fixture,
        elem_1_obj;

    beforeAll(function(){
        fixture.setBase('spec/fixture');
        html_fixture = fixture.load('one.html');
    });

    beforeEach(function(){
        //html_fixture = fixture.load('two.html');
        elem_1_obj = $('#cntnr-0-remove-1');
    });

    afterAll(function(){
        fixture.cleanup();
    });

    it('should return true', function(){
        expect(true).toBe(true);
    });

    it('should return false', function(){
        expect(false).toBe(false);
    });

    it('should get html from DOM object', function(){
        expect(elem_1_obj.html()).toBe('First Paragraph');
    });
});